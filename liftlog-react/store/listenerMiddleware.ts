import {
  createListenerMiddleware,
  addListener,
  ActionCreator,
  UnknownAction,
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
    signal: AbortSignal;
    cancelActiveListeners: () => void;
    dispatch: AppDispatch;
    getState: () => RootState;
    stateAfterReduce: RootState;
    originalState: RootState;
  },
) => void | Promise<void>;

export function addEffect(
  allActions: undefined,
  effect: EffectFn<UnknownAction>,
): void;
export function addEffect<TAction extends { type: string }>(
  action: TAction[],
  effect: EffectFn<UnknownAction>,
): void;
export function addEffect<TAction extends { type: string }>(
  action: TAction,
  effect: EffectFn<TAction extends ActionCreator<infer U> ? U : TAction>,
): void;
export function addEffect(
  actionPredicate: { type: string } | { type: string }[] | undefined,
  effect: EffectFn<UnknownAction>,
) {
  startAppListening({
    predicate: (action) =>
      !actionPredicate ||
      [actionPredicate].flat().some((x) => x.type === action.type),
    effect: async (action, listenerApi) => {
      const originalState = listenerApi.getOriginalState();
      const stateAfterReduce = listenerApi.getState();
      const services = await listenerApi.extra();
      try {
        await effect(action, {
          ...listenerApi,
          originalState,
          stateAfterReduce,
          extra: services,
        });
      } catch (e) {
        services.logger.warn(`Error during effect [${action.type}]:`, e);
        throw e;
      }
    },
  });
}

export const addAppListener = addListener.withTypes<RootState, AppDispatch>();
