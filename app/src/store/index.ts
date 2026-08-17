// oxlint-disable-next-line no-restricted-imports
import { useSelector as untypedUseSelector, UseStore, useStore } from 'react-redux';

import { type RootState, createStore } from '@/store/store';
import { applyProgramEffects } from '@/store/program/effects';
import { applyProgramImportExportEffects } from '@/store/program/import-export-effects';
import { applyWorkoutWorkerEffects } from '@/store/workout-worker/effects';
import { applyAppEffects } from '@/store/app/effects';
import { initializeAppStateSlice } from '@/store/app';
import { useEffect, useMemo, useState } from 'react';
import { applySettingsEffects } from '@/store/settings/effects';
import { applyStoredSessionsEffects } from '@/store/stored-sessions/effects';
import { applyFeedEffects } from '@/store/feed/effects';
import { applyStatsEffects } from '@/store/stats/effects';
import { applyAiPlannerEffects } from '@/store/ai-planner/effects';
import { clearAllListeners, Store } from '@reduxjs/toolkit';
import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { useIsFocused } from 'expo-router';
import { SQLiteDatabase } from 'expo-sqlite';

export { RootState };

export function resolveStore(db: ExpoSQLiteDatabase, expoDb: SQLiteDatabase) {
  const { store, services, addEffect } = createStore(db, expoDb);
  store.dispatch(clearAllListeners());
  applyProgramEffects(addEffect);
  applyProgramImportExportEffects(addEffect);
  applyWorkoutWorkerEffects(addEffect);
  applyAppEffects(addEffect);
  applySettingsEffects(addEffect);
  applyStoredSessionsEffects(addEffect);
  applyFeedEffects(addEffect);
  applyStatsEffects(addEffect);
  applyAiPlannerEffects(addEffect);

  store.dispatch(initializeAppStateSlice());
  return { store, services };
}

export const useAppSelector = untypedUseSelector.withTypes<RootState>();

export function useAppSelectorWithArg<TArg, TRes>(selector: (s: RootState, arg: TArg) => TRes, arg: TArg) {
  const memod = useMemo(() => (s: RootState) => selector(s, arg), [selector, arg]);
  return useAppSelector((s) => memod(s));
}
/** Returned instead of a value while offscreen, so the subscription never re-renders. */
const notRecomputed = Symbol('notRecomputed');

/**
 * For selectors that are expensive to compute, on screens that stay mounted while offscreen - a tab
 * behind another tab, or a list under a pushed detail screen. While unfocused the selector is not run
 * at all (not merely ignored for rendering), so an edit on the visible screen cannot make an invisible
 * one recompute; the last value it saw is returned until it comes back. It is computed once on mount
 * regardless, so a screen that first renders offscreen still has something to show.
 */
export function useAppSelectorWhenFocused<TRes>(selector: (s: RootState) => TRes): TRes {
  const isFocused = useIsFocused();
  const store = useStore<RootState>();
  const currentValue = useAppSelector((s) => (isFocused ? selector(s) : notRecomputed));
  const [lastFocusedValue, setLastFocusedValue] = useState<TRes>(() => selector(store.getState()));

  useEffect(() => {
    if (currentValue !== notRecomputed) {
      setLastFocusedValue(currentValue);
    }
  }, [currentValue]);

  // While focused, hand back what was just computed rather than the copy the effect will store a
  // render later - otherwise every interaction on the screen would lag a frame behind.
  return currentValue === notRecomputed ? lastFocusedValue : currentValue;
}
export function useAppSelectorWhenFocusedWithArg<TArg, TRes>(
  selector: (s: RootState, arg: TArg) => TRes,
  arg: TArg,
): TRes {
  const memod = useMemo(() => (s: RootState) => selector(s, arg), [selector, arg]);
  return useAppSelectorWhenFocused(memod);
}

export const useAppStore = useStore as UseStore<Store<RootState>>;
