import { addEffect, getState } from '@/store/store';
import {
  createFeedIdentity,
  feedApiError,
  fetchInboxItems,
  initializeFeedStateSlice,
  patchFeedState,
  resetFeedAccount,
  revokeFollowSecrets,
  selectFeedIdentityRemote,
  setIdentity,
  setIsHydrated,
  updateFeedIdentity,
} from '@/store/feed';
import { LiftLog } from '@/gen/proto';
import { fromFeedStateDao } from '@/models/storage/conversions.from-dao';
import { toFeedStateDao } from '@/models/storage/conversions.to-dao';
import { RemoteData } from '@/models/remote';
import { addSharedItemEffects } from '@/store/feed/shared-item-effects';
import { showSnackbar } from '@/store/app';
import { addFeedItemEffects } from '@/store/feed/feed-items-effects';
import { addInboxEffects } from '@/store/feed/inbox-effects';
import { addFollowingEffects } from '@/store/feed/following-effects';
import { selectActiveProgram } from '@/store/program';
import { ApiErrorType, ApiResult } from '@/services/api-error';
import { Platform } from 'react-native';

const StorageKey = 'FeedState';
export function applyFeedEffects() {
  addEffect(
    initializeFeedStateSlice,
    async (
      _,
      {
        cancelActiveListeners,
        getState,
        dispatch,
        extra: { keyValueStore, logger, encryptionService },
      },
    ) => {
      cancelActiveListeners();
      const sw = performance.now();
      try {
        const state = await keyValueStore.getItemBytes(StorageKey);
        let hasIdentity = false;
        if (state) {
          const version = await keyValueStore.getItem(`${StorageKey}Version`);
          if (!version || version === '1') {
            try {
              const feedStateDao =
                LiftLog.Ui.Models.FeedStateDaoV1.decode(state);
              const feedState = fromFeedStateDao(feedStateDao);

              if (feedState.identity.isSuccess()) {
                hasIdentity = true;
              }

              dispatch(patchFeedState(feedState));
            } catch (e) {
              logger.error('Could not decode feed state', e);
            }
          }
        }
        if (!hasIdentity) {
          dispatch(
            createFeedIdentity({
              name: undefined,
              publishBodyweight: false,
              publishPlan: false,
              publishWorkouts: false,
              fromUserAction: false,
            }),
          );
        } else {
          if (Platform.OS === 'ios') {
            try {
              await selectFeedIdentityRemote(getState())
                .map((identity) =>
                  encryptionService.encryptRsaOaepSha256Async(
                    new Uint8Array([1, 2, 3]),
                    identity.rsaKeyPair.publicKey,
                  ),
                )
                .unwrapOr(Promise.resolve());
            } catch (error) {
              logger.warn(
                'Failed to encrypt with RSA public key, generating a new one',
                { error },
              );
              const newKeyPair = await encryptionService.generateRsaKeys();
              dispatch(
                updateFeedIdentity({
                  updates: {
                    rsaKeyPair: newKeyPair,
                  },
                  fromUserAction: false,
                }),
              );
            }
          }
        }

        dispatch(setIsHydrated(true));
        dispatch(revokeFollowSecrets({ fromUserAction: false }));
        // Refreshes the identity if it no longer exists on the server
        dispatch(updateFeedIdentity({ fromUserAction: false, updates: {} }));
        dispatch(fetchInboxItems({ fromUserAction: false }));
        const elapsedMilliseconds = performance.now() - sw;
        logger.info(`Feed state initialized in ${elapsedMilliseconds}ms`);
      } catch (e) {
        logger.error('Failed to initialize feed state', e);
        throw e;
      }
    },
  );

  addEffect(feedApiError, async (action, { dispatch, extra: { logger } }) => {
    if (action.payload.action.payload.fromUserAction) {
      dispatch(showSnackbar({ text: action.payload.message }));
    }
    logger.error(
      action.payload.message +
        ' [msg=' +
        action.payload.error.message +
        '; type=' +
        action.payload.error.type +
        ']',
      {
        action,
        error: action.payload.error,
      },
    );
  });

  addEffect(
    undefined,
    async (
      _,
      {
        cancelActiveListeners,
        stateAfterReduce,
        originalState,
        extra: { keyValueStore },
      },
    ) => {
      cancelActiveListeners();
      if (
        stateAfterReduce.feed === originalState.feed ||
        !stateAfterReduce.feed.isHydrated
      ) {
        return;
      }
      const dao = toFeedStateDao(stateAfterReduce.feed);
      const bytes = LiftLog.Ui.Models.FeedStateDaoV1.encode(dao).finish();

      await keyValueStore.setItem(StorageKey, bytes);
      await keyValueStore.setItem(`${StorageKey}Version`, '1');
    },
  );

  addEffect(
    createFeedIdentity,
    async (
      action,
      {
        cancelActiveListeners,
        getState,
        dispatch,
        extra: { feedIdentityService },
      },
    ) => {
      cancelActiveListeners();
      if (getState().feed.identity.isLoading()) {
        return;
      }
      const payload = action.payload;
      dispatch(setIdentity(RemoteData.loading()));
      const identityResult = await feedIdentityService.createFeedIdentityAsync(
        payload.name,
        undefined,
        payload.publishBodyweight,
        payload.publishPlan,
        payload.publishWorkouts,
        [],
      );
      if (!identityResult.isSuccess()) {
        dispatch(
          feedApiError({
            message: 'Failed to create user',
            error: identityResult.error!,
            action,
          }),
        );
        dispatch(setIdentity(RemoteData.error(identityResult.error)));
        return;
      }
      dispatch(setIdentity(RemoteData.success(identityResult.data)));
    },
  );

  addEffect(
    resetFeedAccount,
    async (
      action,
      { dispatch, stateAfterReduce, extra: { feedIdentityService } },
    ) => {
      const identityRemote = selectFeedIdentityRemote(stateAfterReduce);

      const result = await identityRemote
        .map((i) => feedIdentityService.deleteFeedIdentityAsync(i))
        .unwrapOr(Promise.resolve(ApiResult.success()));
      if (result.isError() && result.error.type !== ApiErrorType.NotFound) {
        dispatch(
          feedApiError({
            message: 'Failed to reset account',
            error: result.error,
            action,
          }),
        );
        return;
      }
      dispatch(
        patchFeedState({
          isHydrated: true,
          identity: RemoteData.notAsked(),
          isFetching: false,
          feed: [],
          followedUsers: {},
          sharedFeedUser: RemoteData.notAsked(),
          followRequests: [],
          followers: {},
          unpublishedSessionIds: [],
          sharedItem: RemoteData.notAsked(),
        }),
      );
      dispatch(
        createFeedIdentity({
          fromUserAction: true,
          name: action.payload.newIdentity?.name,
          publishBodyweight:
            action.payload.newIdentity?.publishBodyweight ?? false,
          publishPlan: action.payload.newIdentity?.publishPlan ?? false,
          publishWorkouts: action.payload.newIdentity?.publishWorkouts ?? false,
        }),
      );
    },
  );

  addEffect(
    updateFeedIdentity,
    async (
      action,
      {
        stateAfterReduce,
        dispatch,
        extra: { feedIdentityService },
        cancelActiveListeners,
        signal,
      },
    ) => {
      cancelActiveListeners();
      const oldFeedIdentity = selectFeedIdentityRemote(stateAfterReduce);
      if (!oldFeedIdentity.isSuccess()) {
        return;
      }
      dispatch(
        setIdentity(oldFeedIdentity.map((x) => x.with(action.payload.updates))),
      );
      const feedIdentityRemote = selectFeedIdentityRemote(getState());
      if (!feedIdentityRemote.isSuccess()) {
        dispatch(setIdentity(oldFeedIdentity));
        return;
      }
      const identity = feedIdentityRemote.data;
      // We optimistically updated the identity, so now we can just use its values
      const result = await feedIdentityService.updateFeedIdentityAsync(
        identity.id,
        identity.lookup,
        identity.password,
        identity.aesKey,
        identity.rsaKeyPair,
        identity.name,
        identity.profilePicture,
        identity.publishBodyweight,
        identity.publishPlan,
        identity.publishWorkouts,
        selectActiveProgram(stateAfterReduce).sessions,
      );
      if (signal.aborted) {
        return;
      }

      if (result.isError()) {
        if (result.error.type === ApiErrorType.NotFound) {
          dispatch(
            resetFeedAccount({
              fromUserAction: action.payload.fromUserAction,
              newIdentity: identity,
            }),
          );
        }
        dispatch(
          feedApiError({
            message: 'Failed to update profile',
            error: result.error,
            action,
          }),
        );
        dispatch(setIdentity(oldFeedIdentity));
        return;
      }

      dispatch(setIdentity(RemoteData.success(result.data!)));
    },
  );

  addSharedItemEffects();
  addFeedItemEffects();
  addInboxEffects();
  addFollowingEffects();
}
