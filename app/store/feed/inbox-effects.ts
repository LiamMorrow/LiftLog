import { addEffect } from '@/store/store';
import {
  fetchInboxItems,
  feedApiError,
  setFollowRequests,
  processFollowResponses,
  selectFeedIdentityRemote,
  selectFeedFollowRequests,
  revokeFollowSecretAndRemoveFollower,
  selectFeedFollowers,
} from '@/store/feed';
import { FollowRequest } from '@/models/feed-models';
import { GetInboxMessagesRequest } from '@/models/feed-api-models';
import { fromUuidDao } from '@/models/storage/conversions.from-dao';
import { AesKey } from '@/models/encryption-models';

export function addInboxEffects() {
  addEffect(
    fetchInboxItems,
    async (
      action,
      {
        dispatch,
        getState,
        extra: { feedApiService, feedInboxDecryptionService },
      },
    ) => {
      const state = getState();
      const identityRemote = selectFeedIdentityRemote(state);

      if (!identityRemote.isSuccess()) {
        return;
      }

      const identity = identityRemote.data;

      const inboxItemsResponse = await feedApiService.getInboxMessagesAsync({
        userId: identity.id,
        password: identity.password,
      } as GetInboxMessagesRequest);

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
        await Promise.all(
          encryptedInboxItems.map((x) =>
            feedInboxDecryptionService.decryptIfValid(identity, x),
          ),
        )
      ).filter((x) => x !== null);

      // Process follow requests
      const newFollowRequests = inboxItems
        .filter((x) => x.messagePayload === 'followRequest')
        .map((x) => {
          const userId = fromUuidDao(x.fromUserId);
          const name = x.followRequest?.name?.value;
          return new FollowRequest(userId, name ?? undefined);
        });

      if (newFollowRequests.length > 0) {
        const currentFollowRequests = selectFeedFollowRequests(getState());
        const updatedFollowRequests = [
          ...currentFollowRequests,
          ...newFollowRequests,
        ];
        dispatch(setFollowRequests(updatedFollowRequests));

        // If someone is requesting to follow again, they have lost their follow secret and we should purge them
        const currentFollowers = selectFeedFollowers(getState());
        for (const newRequest of updatedFollowRequests) {
          const existingFollower = currentFollowers.find(
            (follower) => follower.id === newRequest.userId,
          );
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

      // Process follow responses
      const newFollowResponses = inboxItems
        .filter((x) => x.messagePayload === 'followResponse')
        .map((x) => {
          const userId = fromUuidDao(x.fromUserId);
          const isAccepted = !!x.followResponse?.accepted;

          return {
            userId,
            accepted: isAccepted,
            aesKey: isAccepted
              ? ({ value: x.followResponse?.accepted?.aesKey } as AesKey)
              : null,
            followSecret: isAccepted
              ? x.followResponse?.accepted?.followSecret
              : null,
          };
        });

      dispatch(processFollowResponses({ responses: newFollowResponses }));

      // Process unfollow notifications
      const followersWhoStoppedFollowing = inboxItems
        .filter((x) => x.messagePayload === 'unfollowNotification')
        .map((x) => fromUuidDao(x.fromUserId));

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
