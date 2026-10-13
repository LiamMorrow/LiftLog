import { AddEffectFn } from '@/store/store';
import {
  fetchAndSetSharedFeedUser,
  requestFollowUser,
  processFollowResponses,
  unfollowFeedUser,
  acceptFollowRequest,
  denyFollowRequest,
  revokeFollowSecretAndRemoveFollower,
  setSharedFeedUser,
  putFollowedUser,
  feedApiError,
  addFollower,
  removeFollower,
  removeFollowRequest,
  fetchFeedItems,
  removeFollowedUser,
  selectFeedFollowers,
  addRevokableFollowSecret,
  revokeFollowSecrets,
  selectFeedIdentityRemote,
  removeRevokableFollowSecret,
  flushOutbox,
} from '@/store/feed';
import { AcceptedFollowResponse, FollowedFeedUser, FollowerFeedUser, PendingFeedUser } from '@/models/feed-models';
import { RemoteData } from '@/models/remote';
import { RsaPublicKey } from '@/models/encryption-models';
import { ApiErrorType } from '@/services/api-error';
import { enqueueOutboxMessages } from '@/db/feed-outbox';

export function addFollowingEffects(addEffect: AddEffectFn) {
  addEffect(fetchAndSetSharedFeedUser, async (action, { dispatch, extra: { feedApiService } }) => {
    dispatch(setSharedFeedUser(RemoteData.loading()));

    const result = await feedApiService.getUserAsync(action.payload.idOrLookup);

    if (result.isSuccess()) {
      const sharedUser = new PendingFeedUser(
        result.data.id,
        { spkiPublicKeyBytes: result.data.rsaPublicKey },
        action.payload.name,
      );
      dispatch(setSharedFeedUser(RemoteData.success(sharedUser)));
    } else {
      dispatch(
        feedApiError({
          message: 'Failed to fetch user',
          error: result.error!,
          action,
        }),
      );
      dispatch(setSharedFeedUser(RemoteData.error(result.error!)));
    }
  });

  addEffect(requestFollowUser, async (action, { dispatch, getState, extra: { db, feedFollowService } }) => {
    const state = getState();
    const identityRemote = state.feed.identity;

    if (!identityRemote.isSuccess()) {
      return;
    }

    const identity = identityRemote.data;
    const user = action.payload.user;
    enqueueOutboxMessages(db, [await feedFollowService.followRequestMessage(identity, user)]);

    // A follower carries a follow secret granting them *our* feed; following them back is a separate
    // grant that only exists once they accept, so they start out pending regardless of what they were.
    dispatch(putFollowedUser(new PendingFeedUser(user.id, user.publicKey, user.name)));
    dispatch(setSharedFeedUser(RemoteData.notAsked()));
    dispatch(flushOutbox());
  });

  addEffect(processFollowResponses, async (action, { dispatch, getState }) => {
    const state = getState();
    const currentFollowedUsers = state.feed.followedUsers;

    action.payload.responses
      .filter((x) => x.payload.response.type === 'AcceptedFollowResponse')
      .forEach((response) => {
        const acceptResponse = response.payload.response as AcceptedFollowResponse;
        const existingUser = currentFollowedUsers[response.senderUserId];
        if (!existingUser) {
          return;
        }

        dispatch(
          putFollowedUser(
            new FollowedFeedUser(
              response.senderUserId,
              existingUser.publicKey,
              existingUser.name ?? undefined,
              undefined,
              acceptResponse.aesKey,
              acceptResponse.followSecret,
            ),
          ),
        );
      });

    new Set(
      action.payload.responses
        .filter((x) => x.payload.response.type === 'RejectedFollowResponse')
        .map((x) => x.senderUserId),
    ).forEach((id) => dispatch(removeFollowedUser(id)));

    dispatch(fetchFeedItems({ fromUserAction: false }));
  });

  addEffect(unfollowFeedUser, async (action, { getState, dispatch, extra: { db, feedFollowService } }) => {
    const state = getState();
    const identityRemote = state.feed.identity;

    if (!identityRemote.isSuccess()) {
      return;
    }

    const identity = identityRemote.data;
    const feedUser = action.payload.feedUser;

    dispatch(removeFollowedUser(feedUser.id));

    if (feedUser.type === 'PendingFeedUser') {
      return;
    }
    enqueueOutboxMessages(db, [await feedFollowService.unfollowMessage(identity, feedUser)]);
    dispatch(flushOutbox());
  });

  addEffect(
    acceptFollowRequest,
    async (action, { dispatch, getState, extra: { db, feedApiService, feedFollowService } }) => {
      const state = getState();
      const identityRemote = state.feed.identity;

      if (!identityRemote.isSuccess()) {
        return;
      }

      const identity = identityRemote.data;
      const request = action.payload.request;

      // Check if there's an existing follower and revoke their secret
      const existingFollower = state.feed.followers[request.senderUserId];
      if (existingFollower && existingFollower.followSecret) {
        await feedFollowService.revokeFollowSecretAsync(identity, existingFollower.followSecret);
      }

      // Fetch user details
      const userResponse = await feedApiService.getUserAsync(request.senderUserId);
      if (!userResponse.isSuccess()) {
        dispatch(
          feedApiError({
            message: 'Failed to fetch user',
            error: userResponse.error!,
            action,
          }),
        );
        return;
      }

      const user = userResponse.data;
      const publicKey: RsaPublicKey = { spkiPublicKeyBytes: user.rsaPublicKey };

      const acceptResponse = await feedFollowService.acceptFollowRequestAsync(identity, request, publicKey);

      if (!acceptResponse.isSuccess()) {
        dispatch(
          feedApiError({
            message: 'Failed to accept follow request',
            error: acceptResponse.error!,
            action,
          }),
        );
        return;
      }

      enqueueOutboxMessages(db, [acceptResponse.data.message]);
      dispatch(
        addFollower(
          new FollowerFeedUser(request.senderUserId, publicKey, request.payload.name, acceptResponse.data.followSecret),
        ),
      );
      dispatch(removeFollowRequest(request));
      dispatch(flushOutbox());
    },
  );

  addEffect(
    denyFollowRequest,
    async (action, { dispatch, getState, extra: { db, feedApiService, feedFollowService, logger } }) => {
      const state = getState();
      const identityRemote = state.feed.identity;

      if (!identityRemote.isSuccess()) {
        return;
      }

      const identity = identityRemote.data;
      const request = action.payload.request;

      const userResponse = await feedApiService.getUserAsync(request.senderUserId);
      if (!userResponse.isSuccess()) {
        logger.error('Failed to deny follow request with error. Removing request anyway.', {
          error: userResponse.error,
        });
        dispatch(removeFollowRequest(request));
        return;
      }

      const publicKey: RsaPublicKey = {
        spkiPublicKeyBytes: userResponse.data.rsaPublicKey,
      };
      enqueueOutboxMessages(db, [await feedFollowService.denyFollowRequestMessage(identity, request, publicKey)]);
      dispatch(removeFollowRequest(request));
      dispatch(flushOutbox());
    },
  );

  addEffect(revokeFollowSecretAndRemoveFollower, async (action, { dispatch, getState }) => {
    const state = getState();

    const userId = action.payload.userId;
    const follower = selectFeedFollowers(state).find((x) => x.id === userId);

    if (follower?.followSecret) {
      dispatch(addRevokableFollowSecret(follower.followSecret));
    }

    dispatch(removeFollower(userId));
    dispatch(revokeFollowSecrets({ fromUserAction: action.payload.fromUserAction }));
  });

  addEffect(revokeFollowSecrets, async (action, { dispatch, getState, extra: { feedFollowService } }) => {
    const revokableSecrets = getState().feed.revokedFollowSecrets;
    const identity = selectFeedIdentityRemote(getState());
    if (!revokableSecrets.length || !identity.isSuccess()) {
      return;
    }

    for (const secret of revokableSecrets) {
      const deleteFollowSecretResponse = await feedFollowService.revokeFollowSecretAsync(identity.data, secret);

      if (
        !deleteFollowSecretResponse.isSuccess() &&
        deleteFollowSecretResponse.error?.type !== ApiErrorType.Unauthorized &&
        deleteFollowSecretResponse.error?.type !== ApiErrorType.NotFound
      ) {
        dispatch(
          feedApiError({
            message: 'Failed to remove follower',
            error: deleteFollowSecretResponse.error!,
            action,
          }),
        );
        return;
      }
      dispatch(removeRevokableFollowSecret(secret));
    }
  });
}
