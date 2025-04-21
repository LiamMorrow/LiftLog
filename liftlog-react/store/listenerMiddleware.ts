import { createListenerMiddleware, addListener } from '@reduxjs/toolkit';
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

export const addEffect = <
  TActionType extends { type: string } | ((action: unknown) => boolean),
  TEffectFn extends (
    action: unknown,
    listenerApi: {
      extra: Services;
      cancelActiveListeners: () => void;
      dispatch: AppDispatch;
      getState: () => RootState;
    },
  ) => void | Promise<void>,
>(
  actionPredicate: TActionType,
  effect: TEffectFn,
) =>
  startAppListening({
    predicate: (action) =>
      typeof actionPredicate === 'function'
        ? actionPredicate(action)
        : action.type === actionPredicate.type,
    effect: async (action, listenerApi) => {
      const services = await listenerApi.extra();
      effect(action, { ...listenerApi, extra: services });
    },
  });

export const addAppListener = addListener.withTypes<RootState, AppDispatch>();
