// eslint-disable-next-line no-restricted-imports
import { useSelector as untypedUseSelector, UseSelector } from 'react-redux';

import store, { type RootState, type AppDispatch } from '@/store/store';
import { applyProgramEffects } from '@/store/program/effects';

export { store, RootState, AppDispatch };

applyProgramEffects();

export const useSelector: UseSelector<RootState> = untypedUseSelector;
