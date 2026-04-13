// eslint-disable-next-line no-restricted-imports
import { useSelector as untypedUseSelector } from 'react-redux';

import { type RootState, type AppDispatch, createStore } from '@/store/store';
import { applyProgramEffects } from '@/store/program/effects';
import { applyCurrentSessionEffects } from '@/store/current-session/effects';
import { applyAppEffects } from '@/store/app/effects';
import { initializeAppStateSlice } from '@/store/app';
import { useMemo } from 'react';
import { applySettingsEffects } from '@/store/settings/effects';
import { applyStoredSessionsEffects } from '@/store/stored-sessions/effects';
import { applyFeedEffects } from '@/store/feed/effects';
import { applyStatsEffects } from '@/store/stats/effects';
import { applyAiPlannerEffects } from '@/store/ai-planner/effects';
import { clearAllListeners } from '@reduxjs/toolkit';
import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';

export { RootState, AppDispatch };

export function resolveStore(db: ExpoSQLiteDatabase) {
  const { store, addEffect } = createStore(db);
  store.dispatch(clearAllListeners());
  applyProgramEffects(addEffect);
  applyCurrentSessionEffects(addEffect);
  applyAppEffects(addEffect);
  applySettingsEffects(addEffect);
  applyStoredSessionsEffects(addEffect);
  applyFeedEffects(addEffect);
  applyStatsEffects(addEffect);
  applyAiPlannerEffects(addEffect);

  store.dispatch(initializeAppStateSlice());
  return store;
}

export const useAppSelector = untypedUseSelector.withTypes<RootState>();

export function useAppSelectorWithArg<TArg, TRes>(
  selector: (s: RootState, arg: TArg) => TRes,
  arg: TArg,
) {
  const memod = useMemo(
    () => (s: RootState) => selector(s, arg),
    [selector, arg],
  );
  return useAppSelector((s) => memod(s));
}
