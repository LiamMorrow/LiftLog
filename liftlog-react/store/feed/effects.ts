import { addEffect } from '@/store/listenerMiddleware';
import {
  createFeedIdentity,
  fetchInboxItemsAction,
  initializeFeedStateSlice,
  setIsHydrated,
} from '@/store/feed';
import { LiftLog } from '@/gen/proto';
import { fromFeedStateDao } from '@/models/storage/conversions.from-dao';
import { toFeedStateDao } from '@/models/storage/conversions.to-dao';

const StorageKey = 'FeedState';
export function applyFeedEffects() {
  addEffect(
    initializeFeedStateSlice,
    async (
      _,
      { cancelActiveListeners, dispatch, extra: { keyValueStore, logger } },
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
            if (feedState) {
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
              }
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
}
