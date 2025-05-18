import { addEffect } from '@/store/listenerMiddleware';
import {
  createFeedIdentity,
  feedApiError,
  fetchInboxItemsAction,
  initializeFeedStateSlice,
  setIdentity,
  setIsHydrated,
} from '@/store/feed';
import { LiftLog } from '@/gen/proto';
import { fromFeedStateDao } from '@/models/storage/conversions.from-dao';
import { toFeedStateDao } from '@/models/storage/conversions.to-dao';
import { RemoteData } from '@/models/remote';
import { selectActiveProgram } from '@/store/program';
import { addSharedItemEffects } from '@/store/feed/shared-item-effects';

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
        if (state) {
          const version = await keyValueStore.getItem(`${StorageKey}Version`);
          if (!version || version === '1') {
            const feedStateDao = LiftLog.Ui.Models.FeedStateDaoV1.decode(state);
            const feedState = fromFeedStateDao(feedStateDao);

            if (!feedState.identity) {
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
              dispatch(setIdentity(RemoteData.success(feedState.identity)));
            }
          }
        }
        dispatch(setIsHydrated(true));
        dispatch(fetchInboxItemsAction({ fromUserAction: false }));
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
      // TODO dispatch toast
    }
    logger.error(action.payload.message, {
      action,
      error: action.payload.error,
    });
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
        extra: { feedIdentityService, encryptionService },
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
        selectActiveProgram(getState()).sessions,
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

  addSharedItemEffects();
}
