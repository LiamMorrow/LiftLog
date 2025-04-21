// eslint-disable-next-line no-restricted-imports
import { useSelector as untypedUseSelector, UseSelector } from 'react-redux';

import store, { type RootState, type AppDispatch } from '@/store/store';
import { applyProgramEffects } from '@/store/program/effects';
import { applyCurrentSessionEffects } from '@/store/current-session/effects';

export { store, RootState, AppDispatch };

applyProgramEffects();
applyCurrentSessionEffects();

export const useAppSelector: UseSelector<RootState> = untypedUseSelector;
