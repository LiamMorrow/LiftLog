import { addEffect } from '@/store/store';
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
  replaceFeedFollowedUsers,
  fetchFeedItems,
  removeFollowedUser,
  selectFeedFollowers,
  addRevokableFollowSecret,
  revokeFollowSecrets,
  selectFeedIdentityRemote,
  removeRevokableFollowSecret,
} from '@/store/feed';
import { LiftLog } from '@/gen/proto';
import { FeedIdentity, FeedUser } from '@/models/feed-models';
import { RemoteData } from '@/models/remote';
import { RsaPublicKey } from '@/models/encryption-models';
import { PutInboxMessageRequest } from '@/models/feed-api-models';
import { toUuidDao } from '@/models/storage/conversions.to-dao';
import { FeedInboxDecryptionService } from '@/services/feed-inbox-decryption-service';
import { ApiErrorType } from '@/services/api-error';

export function addFollowingEffects() {
  addEffect(
    fetchAndSetSharedFeedUser,
    async (action, { dispatch, extra: { feedApiService } }) => {
      dispatch(setSharedFeedUser(RemoteData.loading()));

      const result = await feedApiService.getUserAsync(
        action.payload.idOrLookup,
      );

      if (result.isSuccess()) {
        const sharedUser = FeedUser.fromShared(
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

      const identity = FeedIdentity.fromPOJO(identityRemote.data);
      const sharedFeedUser = FeedUser.fromPOJO(sharedFeedUserRemote.data);
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
    const currentFollowedUsers = Object.values(state.feed.followedUsers).map(
      FeedUser.fromPOJO,
    );

    const acceptedResponses = action.payload.responses
      .filter((x) => x.accepted)
      .reduce(
        (acc, response) => {
          acc[response.userId] = response;
          return acc;
        },
        {} as Record<string, (typeof action.payload.responses)[0]>,
      );

    const rejectedUserIds = new Set(
      action.payload.responses.filter((x) => !x.accepted).map((x) => x.userId),
    );

    const usersAfterResponses = currentFollowedUsers
      .map((user) => {
        const acceptedResponse = acceptedResponses[user.id];
        if (acceptedResponse) {
          return new FeedUser(
            user.id,
            user.publicKey,
            user.name ?? undefined,
            user.nickname,
            user.currentPlan,
            user.profilePicture,
            acceptedResponse.aesKey || user.aesKey,
            acceptedResponse.followSecret ?? undefined,
          );
        }
        return user;
      })
      .filter((user) => !rejectedUserIds.has(user.id));

    dispatch(replaceFeedFollowedUsers(usersAfterResponses));
    dispatch(fetchFeedItems({ fromUserAction: false }));
  });

  addEffect(
    unfollowFeedUser,
    async (
      action,
      { getState, dispatch, extra: { encryptionService, feedApiService } },
    ) => {
      const state = getState();
      const identityRemote = state.feed.identity;

      if (!identityRemote.isSuccess()) {
        return;
      }

      const identity = FeedIdentity.fromPOJO(identityRemote.data);
      const feedUser = action.payload.feedUser;

      dispatch(removeFollowedUser(feedUser));

      if (!feedUser.followSecret) {
        return;
      }

      const inboxMessage = LiftLog.Ui.Models.InboxMessageDao.create({
        fromUserId: toUuidDao(identity.id),
        unfollowNotification: {
          followSecret: feedUser.followSecret,
        },
      });

      const signaturePayload = FeedInboxDecryptionService.getSignaturePayload(
        inboxMessage,
        feedUser.id,
      );
      const signature = await encryptionService.signRsaPssSha256Async(
        signaturePayload,
        identity.rsaKeyPair.privateKey,
      );
      inboxMessage.signature = signature;

      const messageBytes =
        LiftLog.Ui.Models.InboxMessageDao.encode(inboxMessage).finish();
      const encryptedInboxMessage =
        await encryptionService.encryptRsaOaepSha256Async(
          messageBytes,
          feedUser.publicKey,
        );

      await feedApiService.putInboxMessageAsync({
        toUserId: feedUser.id,
        encryptedMessage: encryptedInboxMessage.dataChunks,
      } as PutInboxMessageRequest);
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

      const identity = FeedIdentity.fromPOJO(identityRemote.data);
      const request = action.payload.request;

      // Check if there's an existing follower and revoke their secret
      const existingFollower = state.feed.followers[request.userId];
      if (existingFollower && existingFollower.followSecret) {
        await feedFollowService.revokeFollowSecretAsync(
          identity,
          existingFollower.followSecret,
        );
      }

      // Fetch user details
      const userResponse = await feedApiService.getUserAsync(request.userId);
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
      const newFollower = new FeedUser(
        request.userId,
        publicKey,
        request.name,
        undefined, // nickname
        [], // currentPlan
        undefined, // profilePicture
        undefined, // aesKey
        followSecretResponse.data, // followSecret
      );

      dispatch(addFollower(newFollower));
      dispatch(removeFollowRequest(request));
    },
  );

  addEffect(
    denyFollowRequest,
    async (
      action,
      { dispatch, getState, extra: { feedApiService, feedFollowService } },
    ) => {
      const state = getState();
      const identityRemote = state.feed.identity;

      if (!identityRemote.isSuccess()) {
        return;
      }

      const identity = FeedIdentity.fromPOJO(identityRemote.data);
      const request = action.payload.request;

      const userResponse = await feedApiService.getUserAsync(request.userId);
      if (!userResponse.isSuccess()) {
        console.error(
          'Failed to deny follow request with error:',
          userResponse.error,
          'Removing request anyway.',
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
        console.error(
          'Failed to deny follow request with error:',
          result.error,
          'Removing request anyway.',
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
