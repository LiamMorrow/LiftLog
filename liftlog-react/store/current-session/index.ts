import { ExerciseBlueprint } from '@/models/blueprint-models';
import { RecordedExercise, Session } from '@/models/session-models';
import { getCycledRepCount } from '@/store/current-session/helpers';
import { SafeDraft, toSafeDraft } from '@/utils/store-helpers';
import { LocalDate, LocalDateTime } from '@js-joda/core';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { Draft, WritableDraft } from 'immer';
import Enumerable from 'linq';

interface CurrentSessionState {
  isHydrated: boolean;
  workoutSession: Session | undefined;
  historySession: Session | undefined;
  feedSession: Session | undefined;
  latestSetTimerNotificationId: string | undefined;
}

export type SessionTarget = 'workoutSession' | 'historySession' | 'feedSession';

const initialState: CurrentSessionState = {
  isHydrated: false,
  workoutSession: undefined,
  historySession: undefined,
  feedSession: undefined,
  latestSetTimerNotificationId: undefined,
};

type TargetedSessionAction<TPayload> = PayloadAction<{
  target: SessionTarget;
  payload: TPayload;
}>;

// Only apply the action if the target is defined
function targetedSessionAction<T>(
  reducer: (
    session: SafeDraft<Session>,
    action: T,
    target: SessionTarget,
    state: SafeDraft<CurrentSessionState>,
  ) => void,
) {
  return (
    state: Draft<CurrentSessionState>,
    action: TargetedSessionAction<T>,
  ) => {
    if (state[action.payload.target] !== undefined) {
      reducer(
        toSafeDraft(state[action.payload.target]!),
        action.payload.payload,
        action.payload.target,
        toSafeDraft(state),
      );
    }
  };
}

const currentSessionSlice = createSlice({
  name: 'currentSession',
  initialState,
  reducers: {
    setIsHydrated(state, action: PayloadAction<boolean>) {
      state.isHydrated = action.payload;
    },

    setActiveSessionDate: targetedSessionAction((session, date: LocalDate) => {
      session.date = date;
    }),

    cycleExerciseReps: targetedSessionAction(
      (
        session,
        action: {
          exerciseIndex: number;
          setIndex: number;
          time: LocalDateTime;
        },
      ) => {
        const exerciseBlueprint =
          session.blueprint.exercises[action.exerciseIndex];

        if (!Session.isStarted(session as unknown as Session)) {
          session.date = action.time.toLocalDate();
        }

        session.recordedExercises[action.exerciseIndex].potentialSets[
          action.setIndex
        ].set = getCycledRepCount(
          session.recordedExercises[action.exerciseIndex].potentialSets[
            action.setIndex
          ].set,
          exerciseBlueprint,
          action.time,
        );
      },
    ),

    removeExercise: targetedSessionAction(
      (session, action: { exerciseIndex: number }) => {
        session.recordedExercises.splice(action.exerciseIndex, 1);
        session.blueprint.exercises.splice(action.exerciseIndex, 1);
      },
    ),

    editExercise: targetedSessionAction(
      (
        session,
        action: { exerciseIndex: number; newBlueprint: ExerciseBlueprint },
      ) => {
        const existingExercise =
          session.recordedExercises[action.exerciseIndex];

        session.blueprint.exercises[action.exerciseIndex] = action.newBlueprint;

        session.recordedExercises[action.exerciseIndex].potentialSets =
          Enumerable.range(0, action.newBlueprint.sets)
            .select(
              (index) =>
                existingExercise.potentialSets[index] ?? {
                  weight: RecordedExercise.maxWeight(existingExercise),
                  set: undefined,
                },
            )
            .toArray();

        session.recordedExercises[action.exerciseIndex].blueprint =
          action.newBlueprint;
      },
    ),

    addExercise: targetedSessionAction(
      (session, action: { blueprint: ExerciseBlueprint }) => {
        session.blueprint.exercises.push(action.blueprint);
        const newRecordedExercise = {
          blueprint: action.blueprint,
          potentialSets: Enumerable.range(0, action.blueprint.sets)
            .select(() => ({
              weight: new BigNumber(0),
              set: undefined,
            }))
            .toArray(),
          notes: undefined,
          perSetWeight: false,
        } satisfies RecordedExercise;
        session.recordedExercises.push(newRecordedExercise);
      },
    ),

    setExerciseReps: targetedSessionAction(
      (
        session,
        action: {
          exerciseIndex: number;
          setIndex: number;
          reps: number | undefined;
          time: LocalDateTime;
        },
      ) => {
        session.recordedExercises[action.exerciseIndex].potentialSets[
          action.setIndex
        ].set =
          action.reps === undefined
            ? undefined
            : {
                repsCompleted: action.reps,
                completionDateTime: action.time,
              };
      },
    ),

    toggleExercisePerSetWeight: targetedSessionAction(
      (session, action: { exerciseIndex: number }) => {
        session.recordedExercises[action.exerciseIndex].perSetWeight =
          !session.recordedExercises[action.exerciseIndex].perSetWeight;
      },
    ),

    updateWeightForSet: targetedSessionAction(
      (
        session,
        action: {
          exerciseIndex: number;
          setIndex: number;
          weight: BigNumber;
        },
      ) => {
        session.recordedExercises[action.exerciseIndex].potentialSets[
          action.setIndex
        ].weight = action.weight;
      },
    ),

    updateExerciseWeight: targetedSessionAction(
      (
        session,
        action: {
          exerciseIndex: number;
          weight: BigNumber;
        },
      ) => {
        session.recordedExercises[action.exerciseIndex].potentialSets.forEach(
          (set) => {
            set.weight = action.weight;
          },
        );
      },
    ),

    setLatestSetTimerNotificationId(state, action: PayloadAction<string>) {
      state.latestSetTimerNotificationId = action.payload;
    },

    setCurrentSession: (
      state,
      action: PayloadAction<{
        target: SessionTarget;
        session: Session;
      }>,
    ) => {
      state[action.payload.target] = action.payload
        .session as unknown as WritableDraft<Session>;
    },

    updateNotesForExercise: targetedSessionAction(
      (
        session,
        action: { exerciseIndex: number; notes: string | undefined },
      ) => {
        session.recordedExercises[action.exerciseIndex].notes = action.notes;
      },
    ),

    updateBodyweight: targetedSessionAction(
      (session, action: { bodyweight: BigNumber | undefined }) => {
        session.bodyweight = action.bodyweight;
      },
    ),
  },
});

export const {
  cycleExerciseReps,
  setActiveSessionDate,
  setIsHydrated,
  removeExercise,
  editExercise,
  addExercise,
  setExerciseReps,
  toggleExercisePerSetWeight,
  updateWeightForSet,
  updateExerciseWeight,
  setLatestSetTimerNotificationId,
  setCurrentSession,
  updateNotesForExercise,
  updateBodyweight,
} = currentSessionSlice.actions;

export default currentSessionSlice.reducer;
