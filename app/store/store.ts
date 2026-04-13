import {
  configureStore,
  combineReducers,
  ActionCreator,
  addListener,
  createListenerMiddleware,
  UnknownAction,
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
import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';

export function createStore(db: ExpoSQLiteDatabase) {
  const listenerMiddleware = createListenerMiddleware({
    extra: (s: AppStore) => resolveServices(s, db),
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

  const startAppListening = listenerMiddleware.startListening;

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

  function addEffect(
    allActions: undefined,
    effect: EffectFn<UnknownAction>,
  ): void;
  function addEffect<TAction extends { type: string }>(
    action: TAction[],
    effect: EffectFn<UnknownAction>,
  ): void;
  function addEffect<TAction extends { type: string }>(
    action: TAction,
    effect: EffectFn<TAction extends ActionCreator<infer U> ? U : TAction>,
  ): void;
  function addEffect(
    actionPredicate: { type: string } | { type: string }[] | undefined,
    effect: EffectFn<UnknownAction>,
  ) {
    startAppListening({
      predicate: (action) =>
        !actionPredicate ||
        [actionPredicate].flat().some((x) => x.type === action.type),
      effect: async (action, listenerApi) => {
        const originalState = listenerApi.getOriginalState() as RootState;
        const stateAfterReduce = listenerApi.getState() as RootState;
        const services = listenerApi.extra(store);
        try {
          await effect(action, {
            ...listenerApi,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
            dispatch: listenerApi.dispatch as any,
            getState: listenerApi.getState as () => RootState,
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
  const addAppListener = addListener;

  return {
    store,
    addAppListener,
    addEffect,
  };
}

type AppStore = ReturnType<typeof createStore>['store'];

export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
export type AddEffectFn = ReturnType<typeof createStore>['addEffect'];
