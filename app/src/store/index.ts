// oxlint-disable-next-line no-restricted-imports
import { useSelector as untypedUseSelector } from 'react-redux';

import { type RootState, createStore } from '@/store/store';
import { applyProgramEffects } from '@/store/program/effects';
import { applyProgramImportExportEffects } from '@/store/program/import-export-effects';
import { applyCurrentSessionEffects } from '@/store/current-session/effects';
import { applyAppEffects } from '@/store/app/effects';
import { initializeAppStateSlice } from '@/store/app';
import { useEffect, useMemo, useState } from 'react';
import { applySettingsEffects } from '@/store/settings/effects';
import { applyStoredSessionsEffects } from '@/store/stored-sessions/effects';
import { applyFeedEffects } from '@/store/feed/effects';
import { applyStatsEffects } from '@/store/stats/effects';
import { applyAiPlannerEffects } from '@/store/ai-planner/effects';
import { clearAllListeners } from '@reduxjs/toolkit';
import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { useIsFocused } from 'expo-router';
import { SQLiteDatabase } from 'expo-sqlite';

export { RootState };

export function resolveStore(db: ExpoSQLiteDatabase, expoDb: SQLiteDatabase) {
  const { store, services, addEffect } = createStore(db, expoDb);
  store.dispatch(clearAllListeners());
  applyProgramEffects(addEffect);
  applyProgramImportExportEffects(addEffect);
  applyCurrentSessionEffects(addEffect);
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
/**
 * Some components are pretty expensive (for some reason) to render, and when offscreen in a deeper stack or different tab should not cause renders
 */
function useAppSelectorWhenFocused<TRes>(selector: (s: RootState) => TRes): TRes {
  const isFocused = useIsFocused();
  const currentValue = useAppSelector(selector);
  const [focusedValue, setFocusedValue] = useState<TRes>(() => currentValue);

  useEffect(() => {
    if (isFocused) {
      setFocusedValue(currentValue);
    }
  }, [isFocused, currentValue]);

  return focusedValue;
}
export function useAppSelectorWhenFocusedWithArg<TArg, TRes>(
  selector: (s: RootState, arg: TArg) => TRes,
  arg: TArg,
): TRes {
  const memod = useMemo(() => (s: RootState) => selector(s, arg), [selector, arg]);
  return useAppSelectorWhenFocused(memod);
}
