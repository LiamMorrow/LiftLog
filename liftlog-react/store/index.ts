// eslint-disable-next-line no-restricted-imports
import { useSelector as untypedUseSelector, UseSelector } from 'react-redux';

import store, { type RootState, type AppDispatch } from '@/store/store';
import { applyProgramEffects } from '@/store/program/effects';
import { applyCurrentSessionEffects } from '@/store/current-session/effects';
import { applyAppEffects } from '@/store/app/effects';
import { initializeAppStateSlice } from '@/store/app';

export { store, RootState, AppDispatch };

applyProgramEffects();
applyCurrentSessionEffects();
applyAppEffects();

store.dispatch(initializeAppStateSlice());

export const useAppSelector: UseSelector<RootState> = untypedUseSelector;
