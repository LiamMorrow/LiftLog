import { setOverallViewTime, setStatsIsDirty } from './index';
import { LocalDate } from '@js-joda/core';
import { fetchOverallStats, setOverallStats } from './index';
import { bodyweightEntriesChanged, putBodyweightEntries, removeBodyweightEntry } from './index';
import { AddEffectFn } from '@/store/store';
import { sessionsChanged } from '@/store/stored-sessions';

import { sleep } from '@/utils/sleep';
import { RemoteData } from '@/models/remote';
import { selectPreferredWeightUnit } from '../settings';
import { calculateStats } from '@/store/stats/calculate-stats';
import { readEarliestSessionDate, readSessionsBetween } from '@/db/sessions';
import { deleteBodyweightEntry, readBodyweightEntries, writeBodyweightEntries } from '@/db/bodyweight-entries';

export function applyStatsEffects(addEffect: AddEffectFn) {
  addEffect(fetchOverallStats, async (_, { getState, dispatch, extra: { db } }) => {
    const state = getState();

    if (state.stats.overallView.isLoading() || !state.stats.isDirty || !state.storedSessions.isHydrated) {
      return;
    }

    dispatch(setOverallStats(RemoteData.loading()));
    await sleep(200);
    try {
      let timeframe = state.stats.overallViewTime;
      const bodyweightEntries = readBodyweightEntries(db, timeframe === 'all-time' ? undefined : timeframe);
      if (timeframe === 'all-time') {
        const earliest = readEarliestSessionDate(db) ?? bodyweightEntries.at(-1)?.date;
        if (!earliest) {
          dispatch(setOverallStats(RemoteData.error('No sessions')));
          return;
        }
        timeframe = {
          from: earliest,
          to: LocalDate.now(),
        };
      }
      const stats = calculateStats(
        readSessionsBetween(db, timeframe.from, timeframe.to),
        selectPreferredWeightUnit(state),
        timeframe,
        bodyweightEntries,
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

  addEffect(sessionsChanged, async (_, { dispatch }) => {
    dispatch(setStatsIsDirty(true));
  });

  addEffect(putBodyweightEntries, async ({ payload }, { dispatch, extra: { db } }) => {
    writeBodyweightEntries(db, payload);
    dispatch(bodyweightEntriesChanged());
  });

  addEffect(removeBodyweightEntry, async ({ payload }, { dispatch, extra: { db } }) => {
    deleteBodyweightEntry(db, payload);
    dispatch(bodyweightEntriesChanged());
  });
}
