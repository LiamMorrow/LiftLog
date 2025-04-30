// eslint-disable-next-line no-restricted-imports
import { useSelector as untypedUseSelector } from 'react-redux';

import store, { type RootState, type AppDispatch } from '@/store/store';
import { applyProgramEffects } from '@/store/program/effects';
import { applyCurrentSessionEffects } from '@/store/current-session/effects';
import { applyAppEffects } from '@/store/app/effects';
import { initializeAppStateSlice } from '@/store/app';
import { useMemo } from 'react';

export { store, RootState, AppDispatch };

applyProgramEffects();
applyCurrentSessionEffects();
applyAppEffects();

store.dispatch(initializeAppStateSlice());

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
