// eslint-disable-next-line no-restricted-imports
import { useSelector as untypedUseSelector } from 'react-redux';

import store, { type RootState, type AppDispatch } from '@/store/store';
import { applyProgramEffects } from '@/store/program/effects';
import { applyCurrentSessionEffects } from '@/store/current-session/effects';
import { applyAppEffects } from '@/store/app/effects';
import { initializeAppStateSlice } from '@/store/app';
import { useMemo } from 'react';
import { initializeProgramStateSlice } from '@/store/program';
import { applySettingsEffects } from '@/store/settings/effects';
import { initializeSettingsStateSlice } from '@/store/settings';
import { applyStoredSessionsEffects } from '@/store/stored-sessions/effects';
import { applyFeedEffects } from '@/store/feed/effects';
import { initializeFeedStateSlice } from '@/store/feed';
import { applyStatsEffects } from '@/store/stats/effects';
import { applyAiPlannerEffects } from '@/store/ai-planner/effects';
import { initializeAiPlannerStateSlice } from '@/store/ai-planner';
import { clearAllListeners } from '@reduxjs/toolkit';

export { store, RootState, AppDispatch };

store.dispatch(clearAllListeners());
applyProgramEffects();
applyCurrentSessionEffects();
applyAppEffects();
applySettingsEffects();
applyStoredSessionsEffects();
applyFeedEffects();
applyStatsEffects();
applyAiPlannerEffects();

store.dispatch(initializeSettingsStateSlice());
store.dispatch(initializeAppStateSlice());
store.dispatch(initializeProgramStateSlice());
store.dispatch(initializeFeedStateSlice());
store.dispatch(initializeAiPlannerStateSlice());

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
