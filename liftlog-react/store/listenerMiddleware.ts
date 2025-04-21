import {
  createListenerMiddleware,
  addListener,
  Action,
  ActionCreator,
} from '@reduxjs/toolkit';
import type { RootState, AppDispatch } from './store';
import { Services } from '@/services';

declare type ExtraArgument = () => Promise<Services>;

export const listenerMiddleware = createListenerMiddleware({
  extra: () => import('@/services').then((x) => x.createServices()),
});

export const startAppListening = listenerMiddleware.startListening.withTypes<
  RootState,
  AppDispatch,
  ExtraArgument
>();

type EffectFn<T> = (
  action: T,
  listenerApi: {
    extra: Services;
    cancelActiveListeners: () => void;
    dispatch: AppDispatch;
    getState: () => RootState;
  },
) => void | Promise<void>;

export function addEffect<TAction extends { type: string }>(
  action: TAction,
  effect: EffectFn<TAction extends ActionCreator<infer U> ? U : TAction>,
): void;
export function addEffect(
  actionPredicate: { type: string } | ((action: Action) => boolean),
  effect: EffectFn<unknown>,
) {
  startAppListening({
    predicate: (action) =>
      'type' in actionPredicate
        ? action.type === actionPredicate.type
        : actionPredicate(action),
    effect: async (action, listenerApi) => {
      const services = await listenerApi.extra();
      effect(action, { ...listenerApi, extra: services });
    },
  });
}

export const addAppListener = addListener.withTypes<RootState, AppDispatch>();
