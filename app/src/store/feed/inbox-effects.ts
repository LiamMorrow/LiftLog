import { AddEffectFn, RootState } from '@/store/store';
import {
  fetchInboxItems,
  feedApiError,
  setFollowRequests,
  processFollowResponses,
  selectFeedIdentityRemote,
  selectFeedFollowRequests,
  revokeFollowSecretAndRemoveFollower,
  selectFeedFollowers,
  upsertReceivedReactions,
} from '@/store/feed';
import {
  FollowRequestInboxMessage,
  FollowResponseInboxMessage,
  MAX_REACTIONS_PER_SENDER_PER_EVENT,
  ReactionInboxMessage,
  ReceivedReaction,
} from '@/models/feed-models';
import { selectSession } from '@/store/stored-sessions';
import { match } from 'ts-pattern';

/**
 * PUT /inbox is unauthenticated by design: anyone who knows your user id can post into your inbox, without
 * compromising the server. The signature proves *who* wrote a message, never that they were entitled to. So a
 * cheer is only accepted if it comes from a current follower and targets a workout you actually own.
 *
 * The emoji allowlist and the count bound are enforced earlier, in `Reaction.fromJSON`.
 */
function acceptableReactions(messages: ReactionInboxMessage[], state: RootState): ReceivedReaction[] {
  const followers = new Set(selectFeedFollowers(state).map((x) => x.id));
  const existing = Object.values(state.feed.receivedReactions);

  const acceptedPerSender = new Map<string, number>();
  for (const reaction of existing) {
    const key = `${reaction.eventId}:${reaction.fromUserId}`;
    acceptedPerSender.set(key, (acceptedPerSender.get(key) ?? 0) + 1);
  }

  const accepted: ReceivedReaction[] = [];

  for (const message of messages) {
    const { senderUserId, payload } = message;

    if (!followers.has(senderUserId)) {
      continue;
    }
    if (!selectSession(state, payload.eventId)) {
      continue;
    }

    const key = `${payload.eventId}:${senderUserId}`;
    const alreadyStored = existing.some((x) => x.id === payload.reactionId);
    if (!alreadyStored && (acceptedPerSender.get(key) ?? 0) >= MAX_REACTIONS_PER_SENDER_PER_EVENT) {
      continue;
    }
    if (!alreadyStored) {
      acceptedPerSender.set(key, (acceptedPerSender.get(key) ?? 0) + 1);
    }

    accepted.push(
      new ReceivedReaction(
        payload.reactionId,
        payload.eventId,
        senderUserId,
        payload.emoji,
        payload.count,
        payload.reactedAt,
      ),
    );
  }

  return accepted;
}

export function addInboxEffects(addEffect: AddEffectFn) {
  addEffect(
    fetchInboxItems,
    async (action, { dispatch, getState, extra: { feedApiService, feedInboxDecryptionService } }) => {
      const state = getState();
      const identityRemote = selectFeedIdentityRemote(state);

      if (!identityRemote.isSuccess()) {
        return;
      }

      const identity = identityRemote.data;

      const inboxItemsResponse = await feedApiService.getInboxMessagesAsync({
        userId: identity.id,
        password: identity.password,
      });

      if (!inboxItemsResponse.isSuccess()) {
        dispatch(
          feedApiError({
            message: 'Failed to fetch inbox items',
            error: inboxItemsResponse.error!,
            action,
          }),
        );
        return;
      }

      const encryptedInboxItems = inboxItemsResponse.data.inboxMessages;

      // Decrypt all inbox messages
      const inboxItems = (
        await Promise.all(encryptedInboxItems.map((x) => feedInboxDecryptionService.decryptIfValid(identity, x)))
      ).filter((x) => x !== null);

      // An exhaustive match, so growing the InboxMessage union breaks the build here rather than silently
      // dropping the new type on the floor.
      const newFollowRequests: FollowRequestInboxMessage[] = [];
      const newFollowResponses: FollowResponseInboxMessage[] = [];
      const followersWhoStoppedFollowing: string[] = [];
      const newReactions: ReactionInboxMessage[] = [];

      for (const item of inboxItems) {
        try {
          match(item)
            .with({ type: 'FollowRequest' }, (x) => newFollowRequests.push(x))
            .with({ type: 'FollowResponse' }, (x) => newFollowResponses.push(x))
            .with({ type: 'UnfollowNotification' }, (x) => followersWhoStoppedFollowing.push(x.senderUserId))
            .with({ type: 'Reaction' }, (x) => newReactions.push(x))
            .exhaustive();
        } catch {
          // continue dropping the message
        }
      }

      // The server deletes inbox messages once we've read them, so this dispatch is the only copy that will
      // ever exist. Persist before anything that could throw or await.
      const accepted = acceptableReactions(newReactions, getState());
      if (accepted.length > 0) {
        dispatch(upsertReceivedReactions(accepted));
      }

      if (newFollowRequests.length > 0) {
        const currentFollowRequests = selectFeedFollowRequests(getState());
        const updatedFollowRequests = [...currentFollowRequests, ...newFollowRequests];
        dispatch(setFollowRequests(updatedFollowRequests));

        // If someone is requesting to follow again, they have lost their follow secret and we should purge them
        const currentFollowers = selectFeedFollowers(getState());
        for (const newRequest of updatedFollowRequests) {
          const existingFollower = currentFollowers.find((follower) => follower.id === newRequest.senderUserId);
          if (existingFollower) {
            dispatch(
              revokeFollowSecretAndRemoveFollower({
                userId: existingFollower.id,
                fromUserAction: false,
              }),
            );
          }
        }
      }

      dispatch(processFollowResponses({ responses: newFollowResponses }));

      // Remove unfollowed users from followers
      followersWhoStoppedFollowing.forEach((userId) => {
        dispatch(
          revokeFollowSecretAndRemoveFollower({
            userId,
            fromUserAction: false,
          }),
        );
      });
    },
  );
}
