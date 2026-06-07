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
} from '@/store/feed';
import {
  AcceptedFollowResponse,
  FollowedFeedUser,
  FollowerFeedUser,
  PendingFeedUser,
} from '@/models/feed-models';
import { RemoteData } from '@/models/remote';
import { RsaPublicKey } from '@/models/encryption-models';
import { ApiErrorType } from '@/services/api-error';

export function addFollowingEffects(addEffect: AddEffectFn) {
  addEffect(
    fetchAndSetSharedFeedUser,
    async (action, { dispatch, extra: { feedApiService } }) => {
      dispatch(setSharedFeedUser(RemoteData.loading()));

      const result = await feedApiService.getUserAsync(
        action.payload.idOrLookup,
      );

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
    },
  );

  addEffect(
    requestFollowUser,
    async (action, { dispatch, getState, extra: { feedFollowService } }) => {
      const state = getState();
      const identityRemote = state.feed.identity;
      const sharedFeedUserRemote = state.feed.sharedFeedUser;

      if (!identityRemote.isSuccess() || !sharedFeedUserRemote.isSuccess()) {
        return;
      }

      const identity = identityRemote.data;
      const sharedFeedUser = sharedFeedUserRemote.data;
      const result = await feedFollowService.requestToFollowAUserAsync(
        identity,
        sharedFeedUser,
      );

      if (result.isSuccess()) {
        dispatch(putFollowedUser(sharedFeedUser));
        dispatch(setSharedFeedUser(RemoteData.notAsked()));
      } else {
        dispatch(
          feedApiError({
            message: 'Failed to request follow user',
            error: result.error!,
            action,
          }),
        );
      }
    },
  );

  addEffect(processFollowResponses, async (action, { dispatch, getState }) => {
    const state = getState();
    const currentFollowedUsers = state.feed.followedUsers;

    action.payload.responses
      .filter((x) => x.payload.response.type === 'AcceptedFollowResponse')
      .forEach((response) => {
        const acceptResponse = response.payload
          .response as AcceptedFollowResponse;
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

  addEffect(
    unfollowFeedUser,
    async (
      action,
      { getState, dispatch, extra: { encryptionService, feedFollowService } },
    ) => {
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
      await feedFollowService.unfollowUserAsync(identity, feedUser);
    },
  );

  addEffect(
    acceptFollowRequest,
    async (
      action,
      { dispatch, getState, extra: { feedApiService, feedFollowService } },
    ) => {
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
        await feedFollowService.revokeFollowSecretAsync(
          identity,
          existingFollower.followSecret,
        );
      }

      // Fetch user details
      const userResponse = await feedApiService.getUserAsync(
        request.senderUserId,
      );
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

      // Accept the follow request
      const followSecretResponse =
        await feedFollowService.acceptFollowRequestAsync(
          identity,
          request,
          publicKey,
        );

      if (!followSecretResponse.isSuccess()) {
        dispatch(
          feedApiError({
            message: 'Failed to accept follow request',
            error: followSecretResponse.error!,
            action,
          }),
        );
        return;
      }

      // Add as follower
      const newFollower = new FollowerFeedUser(
        request.senderUserId,
        publicKey,
        request.payload.name,
        followSecretResponse.data,
      );

      dispatch(addFollower(newFollower));
      dispatch(removeFollowRequest(request));
    },
  );

  addEffect(
    denyFollowRequest,
    async (
      action,
      {
        dispatch,
        getState,
        extra: { feedApiService, feedFollowService, logger },
      },
    ) => {
      const state = getState();
      const identityRemote = state.feed.identity;

      if (!identityRemote.isSuccess()) {
        return;
      }

      const identity = identityRemote.data;
      const request = action.payload.request;

      const userResponse = await feedApiService.getUserAsync(
        request.senderUserId,
      );
      if (!userResponse.isSuccess()) {
        logger.error(
          'Failed to deny follow request with error. Removing request anyway.',
          { error: userResponse.error },
        );
        dispatch(removeFollowRequest(request));
        return;
      }

      const publicKey: RsaPublicKey = {
        spkiPublicKeyBytes: userResponse.data.rsaPublicKey,
      };
      const result = await feedFollowService.denyFollowRequestAsync(
        identity,
        request,
        publicKey,
      );

      if (!result.isSuccess() && result.error?.type !== ApiErrorType.NotFound) {
        logger.error(
          'Failed to deny follow request with error. Removing request anyway.',
          { error: result.error },
        );
      }

      dispatch(removeFollowRequest(request));
    },
  );

  addEffect(
    revokeFollowSecretAndRemoveFollower,
    async (action, { dispatch, getState }) => {
      const state = getState();

      const userId = action.payload.userId;
      const follower = selectFeedFollowers(state).find((x) => x.id === userId);

      if (follower?.followSecret) {
        dispatch(addRevokableFollowSecret(follower.followSecret));
      }

      dispatch(removeFollower(userId));
      dispatch(
        revokeFollowSecrets({ fromUserAction: action.payload.fromUserAction }),
      );
    },
  );

  addEffect(
    revokeFollowSecrets,
    async (action, { dispatch, getState, extra: { feedFollowService } }) => {
      const revokableSecrets = getState().feed.revokedFollowSecrets;
      const identity = selectFeedIdentityRemote(getState());
      if (!revokableSecrets.length || !identity.isSuccess()) {
        return;
      }

      for (const secret of revokableSecrets) {
        const deleteFollowSecretResponse =
          await feedFollowService.revokeFollowSecretAsync(
            identity.data,
            secret,
          );

        if (
          !deleteFollowSecretResponse.isSuccess() &&
          deleteFollowSecretResponse.error?.type !==
            ApiErrorType.Unauthorized &&
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
    },
  );
}
