import { addEffect } from '@/store/store';
import {
  createFeedIdentity,
  feedApiError,
  fetchInboxItems,
  initializeFeedStateSlice,
  patchFeedState,
  resetFeedAccount,
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
import { ApiResult } from '@/services/api-error';
import { FeedIdentity } from '@/models/feed-models';

const StorageKey = 'FeedState';
export function applyFeedEffects() {
  addEffect(
    initializeFeedStateSlice,
    async (
      _,
      {
        cancelActiveListeners,
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
        }
        dispatch(setIsHydrated(true));
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
      if (result.isError()) {
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
          name: undefined,
          publishBodyweight: false,
          publishPlan: false,
          publishWorkouts: false,
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
      const feedIdentityRemote = selectFeedIdentityRemote(stateAfterReduce);
      const { payload } = action;
      if (!feedIdentityRemote.isSuccess()) {
        return;
      }
      dispatch(
        setIdentity(
          feedIdentityRemote.map((x) =>
            FeedIdentity.fromPOJO({ ...x, ...action.payload }),
          ),
        ),
      );
      const identity = feedIdentityRemote.data;

      const result = await feedIdentityService.updateFeedIdentityAsync(
        identity.id,
        identity.lookup,
        identity.password,
        identity.aesKey,
        identity.rsaKeyPair,
        payload.name ?? identity.name,
        payload.profilePicture ?? identity.profilePicture,
        payload.publishBodyweight ?? identity.publishBodyweight,
        payload.publishPlan ?? identity.publishPlan,
        payload.publishWorkouts ?? identity.publishWorkouts,
        selectActiveProgram(stateAfterReduce).sessions,
      );
      if (signal.aborted) {
        return;
      }

      if (result.isError()) {
        dispatch(
          feedApiError({
            message: 'Failed to update profile',
            error: result.error,
            action: {
              ...action,
              payload: { ...action.payload, fromUserAction: true },
            },
          }),
        );
        dispatch(setIdentity(feedIdentityRemote));
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
