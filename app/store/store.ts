import {
  configureStore,
  combineReducers,
  ActionCreator,
  addListener,
  createListenerMiddleware,
  UnknownAction,
  Store,
} from '@reduxjs/toolkit';
import { currentSessionReducer } from './current-session';
import { settingsReducer } from './settings';
import programReducer from './program';
import appReducer from './app';
import feedReducer from './feed';
import { storedSessionsReducer } from './stored-sessions';
import { sessionEditorReducer } from './session-editor';
import { statsReducer } from '@/store/stats';
import { resolveServices, Services } from '@/services';
import { aiPlannerReducer } from '@/store/ai-planner';
import * as Sentry from '@sentry/react-native';
import debounce from 'debounce';

const listenerMiddleware = createListenerMiddleware({
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
  extra: (s: Store) => resolveServices(s as any),
});

const store = configureStore({
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // We manually do persistence
      serializableCheck: false,
      immutableCheck: false,
    }).prepend(listenerMiddleware.middleware),
  reducer: combineReducers({
    currentSession: currentSessionReducer,
    aiPlanner: aiPlannerReducer,
    settings: settingsReducer,
    program: programReducer,
    feed: feedReducer,
    app: appReducer,
    sessionEditor: sessionEditorReducer,
    storedSessions: storedSessionsReducer,
    stats: statsReducer,
  }),
});

export const startAppListening = listenerMiddleware.startListening.withTypes<
  RootState,
  AppDispatch,
  (s: Store<RootState>) => Services
>();

type EffectFn<T> = (
  action: T,
  listenerApi: {
    extra: Services;
    signal: AbortSignal;
    cancelActiveListeners: () => void;
    throwIfCancelled: () => void;
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
      const services = listenerApi.extra(store);
      try {
        await effect(action, {
          ...listenerApi,
          originalState,
          stateAfterReduce,
          extra: services,
        });
      } catch (e) {
        services.logger.warn(`Error during effect [${action.type}]:`, e);
        Sentry.withScope(function (scope) {
          scope.setFingerprint(['{{ default }}', action.type]);
          Sentry.captureException(e);
        });
        return;
      }
    },
  });
}

export function addDebouncedEffect(
  allActions: undefined,
  effect: EffectFn<UnknownAction>,
  time?: number,
): void;
export function addDebouncedEffect<TAction extends { type: string }>(
  action: TAction[],
  effect: EffectFn<UnknownAction>,
  time?: number,
): void;
export function addDebouncedEffect<TAction extends { type: string }>(
  action: TAction,
  effect: EffectFn<TAction extends ActionCreator<infer U> ? U : TAction>,
  time?: number,
): void;
export function addDebouncedEffect(
  actionPredicate: { type: string } | { type: string }[] | undefined,
  effect: EffectFn<UnknownAction>,
  time = 1000,
) {
  addEffect<UnknownAction>(
    actionPredicate as UnknownAction,
    debounce(effect, time),
  );
}

export const addAppListener = addListener.withTypes<RootState, AppDispatch>();

export function getState(): RootState {
  return store.getState();
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
