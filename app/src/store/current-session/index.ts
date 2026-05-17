import { SessionBlueprint } from '@/models/blueprint-models';
import { Session } from '@/models/session-models';
import {
  createAction,
  createSelector,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { WritableDraft } from 'immer';
import { PlanDiff } from '@/models/blueprint-diff';
import { WorkoutMessage } from '@/models/workout-worker-messages';

interface CurrentSessionState {
  isHydrated: boolean;
  workoutSession: Session | undefined;
  historySession: Session | undefined;
  feedSession: Session | undefined;
  sharedSession: Session | undefined;
  currentPlanDiff: PlanDiff | undefined;
}

export type SessionTarget =
  | 'workoutSession'
  | 'historySession'
  | 'feedSession'
  | 'sharedSession';

const initialState: CurrentSessionState = {
  isHydrated: false,
  workoutSession: undefined,
  historySession: undefined,
  feedSession: undefined,
  sharedSession: undefined,
  currentPlanDiff: undefined,
};

export const initializeCurrentSessionStateSlice = createAction(
  'initializeCurrentSessionStateSlice',
);

const currentSessionSlice = createSlice({
  name: 'currentSession',
  initialState,
  reducers: {
    setIsHydrated(state, action: PayloadAction<boolean>) {
      state.isHydrated = action.payload;
    },

    setCurrentPlanDiff(state, action: PayloadAction<PlanDiff | undefined>) {
      state.currentPlanDiff = action.payload;
    },

    setCurrentSession: (
      state,
      action: PayloadAction<{
        target: SessionTarget;
        session: Session | undefined;
      }>,
    ) => {
      state[action.payload.target] = action.payload
        .session as unknown as WritableDraft<Session>;
    },
  },
  selectors: {
    selectState: (x) => x,
  },
});

export const selectCurrentSession = createSelector(
  [
    currentSessionSlice.selectors.selectState,
    (_, target: SessionTarget) => target,
  ],
  (state, target) => state[target],
);

export const clearSetTimerNotification = createAction(
  'clearSetTimerNotification',
);

export const notifySetTimer = createAction('notifySetTimer');

export const setCurrentSessionFromBlueprint = createAction<{
  target: SessionTarget;
  blueprint: SessionBlueprint;
}>('setCurrentSessionFromBlueprint');

export const persistCurrentSession = createAction<SessionTarget>(
  'persistCurrentSession',
);

export const broadcastWorkoutEvent = createAction<WorkoutMessage['payload']>(
  'broadcastWorkoutEvent',
);

export const finishCurrentWorkout = createAction<SessionTarget>(
  'finishCurrentWorkout',
);

export const currentWorkoutSessionUpdated = createAction<{
  before: Session | undefined;
  after: Session | undefined;
}>('currentWorkoutSessionUpdated');

export const { setIsHydrated, setCurrentSession, setCurrentPlanDiff } =
  currentSessionSlice.actions;

export const currentSessionReducer = currentSessionSlice.reducer;
