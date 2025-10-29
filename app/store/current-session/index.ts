import {
  WeightedExerciseBlueprint,
  SessionBlueprint,
  ExerciseBlueprint,
  Distance,
} from '@/models/blueprint-models';
import {
  RecordedWeightedExercise,
  RecordedWeightedExercisePOJO,
  Session,
  SessionPOJO,
  createEmptyRecordedExercise,
} from '@/models/session-models';
import { getCycledRepCount } from '@/store/current-session/helpers';
import { SafeDraft, toSafeDraft } from '@/utils/store-helpers';
import { Duration, LocalDate, LocalDateTime } from '@js-joda/core';
import {
  createAction,
  createSelector,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { Draft, WritableDraft } from 'immer';
import Enumerable from 'linq';

interface CurrentSessionState {
  isHydrated: boolean;
  workoutSession: SessionPOJO | undefined;
  historySession: SessionPOJO | undefined;
  feedSession: SessionPOJO | undefined;
  latestSetTimerNotificationId: string | undefined;
  workoutSessionLastSetTime: LocalDateTime | undefined;
}

export type SessionTarget = 'workoutSession' | 'historySession' | 'feedSession';

export type WeightAppliesTo = 'thisSet' | 'uncompletedSets' | 'allSets';

const initialState: CurrentSessionState = {
  isHydrated: false,
  workoutSession: undefined,
  historySession: undefined,
  feedSession: undefined,
  latestSetTimerNotificationId: undefined,
  workoutSessionLastSetTime: undefined,
};

type TargetedSessionAction<TPayload> = PayloadAction<{
  target: SessionTarget;
  payload: TPayload;
}>;

export const initializeCurrentSessionStateSlice = createAction(
  'initializeCurrentSessionStateSlice',
);

// Only apply the action if the target is defined
function targetedSessionAction<T>(
  reducer: (
    session: SafeDraft<SessionPOJO>,
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
      const originalDate = session.date;
      const newDate = date;

      // Gather all unique, non-null completion dates from all sets
      const allCompletionDates = session.recordedExercises
        .flatMap((re) =>
          re._BRAND === 'RECORDED_WEIGHTED_EXERCISE_POJO'
            ? re.potentialSets.map((ps) =>
                ps.set?.completionDateTime?.toLocalDate(),
              )
            : [re.completionDateTime?.toLocalDate()],
        )
        .filter((d): d is LocalDate => d !== undefined);

      // If all sets have the same completion date, use absolute date
      const useAbsoluteDate =
        allCompletionDates.length > 0 &&
        new Set(allCompletionDates.map((d) => d.toString())).size === 1;

      function getAdjustedDate(setDate: LocalDate): LocalDate {
        if (useAbsoluteDate) {
          return newDate;
        }
        // Maintain relative offset if sets cross midnight
        const dayOffset = setDate.toEpochDay() - originalDate.toEpochDay();
        return newDate.plusDays(dayOffset);
      }

      // Update all sets' completionDateTime
      session.recordedExercises.forEach((re) => {
        if (re._BRAND === 'RECORDED_WEIGHTED_EXERCISE_POJO') {
          re.potentialSets.forEach((ps) => {
            if (ps.set && ps.set.completionDateTime) {
              const setDate = ps.set.completionDateTime.toLocalDate();
              ps.set.completionDateTime = ps.set.completionDateTime
                .toLocalTime()
                .atDate(getAdjustedDate(setDate));
            }
          });
        } else {
          if (re.completionDateTime) {
            re.completionDateTime = re.completionDateTime
              .toLocalTime()
              .atDate(getAdjustedDate(re.completionDateTime.toLocalDate()));
          }
        }
      });
    }),

    cycleExerciseReps: targetedSessionAction(
      (
        session,
        action: {
          exerciseIndex: number;
          setIndex: number;
          time: LocalDateTime;
        },
        target,
        state,
      ) => {
        const exerciseBlueprint =
          session.blueprint.exercises[action.exerciseIndex];
        if (exerciseBlueprint._BRAND !== 'WEIGHTED_EXERCISE_BLUEPRINT_POJO') {
          return;
        }

        if (!Session.fromPOJO(session).isStarted) {
          session.date = action.time.toLocalDate();
        }
        const weightedRecorded = session.recordedExercises[
          action.exerciseIndex
        ] as RecordedWeightedExercisePOJO;
        const repCount = getCycledRepCount(
          weightedRecorded.potentialSets[action.setIndex].set,
          exerciseBlueprint,
          action.time,
        );
        weightedRecorded.potentialSets[action.setIndex].set = repCount;
        if (target === 'workoutSession') {
          state.workoutSessionLastSetTime =
            repCount?.completionDateTime === undefined
              ? Session.fromPOJO(session).lastExercise?.latestTime
              : action.time;
        }
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
        action: {
          exerciseIndex: number;
          newBlueprint: ExerciseBlueprint;
        },
      ) => {
        const existingExercise =
          session.recordedExercises[action.exerciseIndex];

        session.blueprint.exercises[action.exerciseIndex] =
          action.newBlueprint.toPOJO();

        if (
          existingExercise.blueprint._BRAND !==
          action.newBlueprint.toPOJO()._BRAND
        ) {
          session.recordedExercises[action.exerciseIndex] =
            createEmptyRecordedExercise(action.newBlueprint).toPOJO();
        } else {
          const weightedExistingExercise =
            session.recordedExercises[action.exerciseIndex]._BRAND ===
            'RECORDED_WEIGHTED_EXERCISE_POJO'
              ? (session.recordedExercises[
                  action.exerciseIndex
                ] as RecordedWeightedExercisePOJO)
              : undefined;
          if (weightedExistingExercise) {
            weightedExistingExercise.potentialSets = Enumerable.range(
              0,
              (action.newBlueprint as WeightedExerciseBlueprint).sets,
            )
              .select(
                (index) =>
                  weightedExistingExercise.potentialSets[index] ?? {
                    weight: RecordedWeightedExercise.fromPOJO(
                      weightedExistingExercise,
                    ).maxWeight,
                    set: undefined,
                  },
              )
              .toArray();
          }

          session.recordedExercises[action.exerciseIndex].blueprint =
            action.newBlueprint.toPOJO();
        }
      },
    ),

    addExercise: targetedSessionAction(
      (session, action: { blueprint: ExerciseBlueprint }) => {
        session.blueprint.exercises.push(action.blueprint.toPOJO());
        const newRecordedExercise = createEmptyRecordedExercise(
          action.blueprint,
        ).toPOJO();
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
        target,
        state,
      ) => {
        const exercise = session.recordedExercises[action.exerciseIndex];
        if (exercise._BRAND !== 'RECORDED_WEIGHTED_EXERCISE_POJO') {
          return;
        }
        exercise.potentialSets[action.setIndex].set =
          action.reps === undefined
            ? undefined
            : {
                _BRAND: 'RECORDED_SET_POJO',
                repsCompleted: action.reps,
                completionDateTime: action.time,
              };

        if (target === 'workoutSession') {
          state.workoutSessionLastSetTime =
            action.reps === undefined
              ? Session.fromPOJO(session).lastExercise?.latestTime
              : action.time;
        }
      },
    ),

    updateWeightForSet: targetedSessionAction(
      (
        session,
        action: {
          exerciseIndex: number;
          setIndex: number;
          weight: BigNumber;
          applyTo: WeightAppliesTo;
        },
      ) => {
        const exercise = session.recordedExercises[action.exerciseIndex];
        if (exercise._BRAND !== 'RECORDED_WEIGHTED_EXERCISE_POJO') {
          return;
        }
        switch (action.applyTo) {
          case 'thisSet':
            exercise.potentialSets[action.setIndex].weight = action.weight;
            break;
          case 'uncompletedSets':
            exercise.potentialSets.forEach((set, idx) => {
              if (!set.set) {
                set.weight = action.weight;
              }
            });
            break;
          case 'allSets':
            exercise.potentialSets.forEach((set) => {
              set.weight = action.weight;
            });
            break;
        }
      },
    ),

    setLatestSetTimerNotificationId(state, action: PayloadAction<string>) {
      state.latestSetTimerNotificationId = action.payload;
    },

    setCurrentSession: (
      state,
      action: PayloadAction<{
        target: SessionTarget;
        session: Session | undefined;
      }>,
    ) => {
      state[action.payload.target] =
        action.payload.session?.toPOJO() as unknown as WritableDraft<SessionPOJO>;
      if (action.payload.target === 'workoutSession') {
        state.workoutSessionLastSetTime =
          action.payload.session?.lastExercise?.latestTime;
      }
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

    setWorkoutSessionLastSetTime(
      state,
      action: PayloadAction<LocalDateTime | undefined>,
    ) {
      state.workoutSessionLastSetTime = action.payload;
    },

    updateDurationForCardioExercise: targetedSessionAction(
      (
        session,
        action: { duration: Duration | undefined; exerciseIndex: number },
      ) => {
        const exercise = session.recordedExercises[action.exerciseIndex];
        if (exercise._BRAND !== 'RECORDED_CARDIO_EXERCISE_POJO') {
          return;
        }
        exercise.duration = action.duration;
      },
    ),
    updateResistanceForCardioExercise: targetedSessionAction(
      (
        session,
        action: { resistance: BigNumber | undefined; exerciseIndex: number },
      ) => {
        const exercise = session.recordedExercises[action.exerciseIndex];
        if (exercise._BRAND !== 'RECORDED_CARDIO_EXERCISE_POJO') {
          return;
        }
        exercise.resistance = action.resistance;
      },
    ),

    updateInclineForCardioExercise: targetedSessionAction(
      (
        session,
        action: { incline: BigNumber | undefined; exerciseIndex: number },
      ) => {
        const exercise = session.recordedExercises[action.exerciseIndex];
        if (exercise._BRAND !== 'RECORDED_CARDIO_EXERCISE_POJO') {
          return;
        }
        exercise.incline = action.incline;
      },
    ),

    updateDistanceForCardioExercise: targetedSessionAction(
      (
        session,
        action: { distance: Distance | undefined; exerciseIndex: number },
      ) => {
        const exercise = session.recordedExercises[action.exerciseIndex];
        if (exercise._BRAND !== 'RECORDED_CARDIO_EXERCISE_POJO') {
          return;
        }
        exercise.distance = action.distance;
      },
    ),

    setCompletionTimeForCardioExercise: targetedSessionAction(
      (
        session,
        action: { time: LocalDateTime | undefined; exerciseIndex: number },
      ) => {
        const exercise = session.recordedExercises[action.exerciseIndex];
        if (exercise._BRAND !== 'RECORDED_CARDIO_EXERCISE_POJO') {
          return;
        }
        exercise.completionDateTime = action.time;
      },
    ),
  },
  selectors: {
    selectState: (x) => x,
  },
});

const selectCurrentSessionPOJO = createSelector(
  [
    currentSessionSlice.selectors.selectState,
    (_, target: SessionTarget) => target,
  ],
  (state, target) => state[target],
);

export const selectCurrentSession = createSelector(
  selectCurrentSessionPOJO,
  (pojo) => Session.fromPOJO(pojo),
);

export const clearSetTimerNotification = createAction(
  'clearSetTimerNotification',
);

export const notifySetTimer = createAction('notifySetTimer');
export const completeSetFromNotification = createAction(
  'completeSetFromNotification',
);

export const setCurrentSessionFromBlueprint = createAction<{
  target: SessionTarget;
  blueprint: SessionBlueprint;
}>('setCurrentSessionFromBlueprint');

export const persistCurrentSession = createAction<SessionTarget>(
  'persistCurrentSession',
);

export const {
  cycleExerciseReps,
  setActiveSessionDate,
  setIsHydrated,
  removeExercise,
  editExercise,
  addExercise,
  setExerciseReps,
  updateWeightForSet,
  setLatestSetTimerNotificationId,
  setCurrentSession,
  updateNotesForExercise,
  updateBodyweight,
  setWorkoutSessionLastSetTime,
  updateDurationForCardioExercise,
  updateDistanceForCardioExercise,
  updateInclineForCardioExercise,
  updateResistanceForCardioExercise,
  setCompletionTimeForCardioExercise,
} = currentSessionSlice.actions;

export const currentSessionReducer = currentSessionSlice.reducer;
