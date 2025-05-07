import {
  createListenerMiddleware,
  addListener,
  ActionCreator,
} from '@reduxjs/toolkit';
import type { RootState, AppDispatch } from './store';
import { Services } from '@/services';

declare type ExtraArgument = () => Promise<Services>;

export const listenerMiddleware = createListenerMiddleware({
  extra: () => import('@/services').then((x) => x.resolveServices()),
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
  actionPredicate: { type: string },
  effect: EffectFn<unknown>,
) {
  startAppListening({
    predicate: (action) => action.type === actionPredicate.type,
    effect: async (action, listenerApi) => {
      const services = await listenerApi.extra();
      try {
        await effect(action, { ...listenerApi, extra: services });
      } catch (e) {
        services.logger.warn(
          `Error during effect [${actionPredicate.type}]:`,
          e,
        );
        throw e;
      }
    },
  });
}

export const addAppListener = addListener.withTypes<RootState, AppDispatch>();
