import { setOverallViewTime, setStatsIsDirty } from './index';
import { LocalDate } from '@js-joda/core';
import { fetchOverallStats, setOverallStats } from './index';
import { AddEffectFn } from '@/store/store';
import { selectSessionsBy } from '@/store/stored-sessions';

import { sleep } from '@/utils/sleep';
import { RemoteData } from '@/models/remote';
import { selectPreferredWeightUnit } from '../settings';
import { calculateStats } from '@/store/stats/calculate-stats';

export function applyStatsEffects(addEffect: AddEffectFn) {
  addEffect(fetchOverallStats, async (_, { getState, dispatch }) => {
    const state = getState();

    if (
      state.stats.overallView.isLoading() ||
      !state.stats.isDirty ||
      !state.storedSessions.isHydrated
    ) {
      return;
    }

    dispatch(setOverallStats(RemoteData.loading()));
    await sleep(200);
    try {
      let timeframe = state.stats.overallViewTime;
      if (timeframe === 'all-time') {
        if (!state.storedSessions.earliestSession) {
          dispatch(setOverallStats(RemoteData.error('No sessions')));
          return;
        }
        timeframe = {
          from: state.storedSessions.earliestSession.date,
          to: LocalDate.now(),
        };
      }
      const stats = calculateStats(
        selectSessionsBy(state, timeframe.from, timeframe.to),
        selectPreferredWeightUnit(state),
        timeframe,
      );
      dispatch(setOverallStats(RemoteData.success(stats)));
      dispatch(setStatsIsDirty(false));
    } catch (e) {
      dispatch(setOverallStats(RemoteData.error(e)));
    }
  });

  addEffect(setOverallViewTime, async (_, { dispatch }) => {
    dispatch(setStatsIsDirty(true));
    dispatch(fetchOverallStats());
  });
}
