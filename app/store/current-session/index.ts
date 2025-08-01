import { ExerciseBlueprint, SessionBlueprint } from '@/models/session-models';
import {
  RecordedExercise,
  RecordedExercisePOJO,
  Session,
  SessionPOJO,
} from '@/models/session-models';
import { getCycledRepCount } from '@/store/current-session/helpers';
import { SafeDraft, toSafeDraft } from '@/utils/store-helpers';
import { LocalDate, LocalDateTime } from '@js-joda/core';
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
}

export type SessionTarget = 'workoutSession' | 'historySession' | 'feedSession';

export type WeightAppliesTo = 'thisSet' | 'uncompletedSets' | 'allSets';

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
      const allCompletionDates = session.recordedExercises.flatMap((re) =>
        re.potentialSets
          .map((ps) => ps.set?.completionDateTime?.toLocalDate())
          .filter((d): d is LocalDate => d !== undefined),
      );

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
        re.potentialSets.forEach((ps) => {
          if (ps.set && ps.set.completionDateTime) {
            const setDate = ps.set.completionDateTime.toLocalDate();
            ps.set.completionDateTime = ps.set.completionDateTime
              .toLocalTime()
              .atDate(getAdjustedDate(setDate));
          }
        });
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
      ) => {
        const exerciseBlueprint =
          session.blueprint.exercises[action.exerciseIndex];

        if (!Session.fromPOJO(session).isStarted) {
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

        session.blueprint.exercises[action.exerciseIndex] =
          action.newBlueprint.toPOJO();

        session.recordedExercises[action.exerciseIndex].potentialSets =
          Enumerable.range(0, action.newBlueprint.sets)
            .select(
              (index) =>
                existingExercise.potentialSets[index] ?? {
                  weight: RecordedExercise.fromPOJO(existingExercise).maxWeight,
                  set: undefined,
                },
            )
            .toArray();

        session.recordedExercises[action.exerciseIndex].blueprint =
          action.newBlueprint.toPOJO();
      },
    ),

    addExercise: targetedSessionAction(
      (session, action: { blueprint: ExerciseBlueprint }) => {
        session.blueprint.exercises.push(action.blueprint.toPOJO());
        const newRecordedExercise = {
          blueprint: action.blueprint.toPOJO(),
          potentialSets: Enumerable.range(0, action.blueprint.sets)
            .select(() => ({
              _BRAND: 'POTENTIAL_SET_POJO' as const,
              weight: new BigNumber(0),
              set: undefined,
            }))
            .toArray(),
          notes: undefined,
          perSetWeight: true,
          _BRAND: 'RECORDED_EXERCISE_POJO',
        } satisfies RecordedExercisePOJO;
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
                _BRAND: 'RECORDED_SET_POJO',
                repsCompleted: action.reps,
                completionDateTime: action.time,
              };
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
        switch (action.applyTo) {
          case 'thisSet':
            session.recordedExercises[action.exerciseIndex].potentialSets[
              action.setIndex
            ].weight = action.weight;
            break;
          case 'uncompletedSets':
            session.recordedExercises[
              action.exerciseIndex
            ].potentialSets.forEach((set, idx) => {
              if (!set.set) {
                set.weight = action.weight;
              }
            });
            break;
          case 'allSets':
            session.recordedExercises[
              action.exerciseIndex
            ].potentialSets.forEach((set) => {
              set.weight = action.weight;
            });
            break;
        }
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
        session: Session | undefined;
      }>,
    ) => {
      state[action.payload.target] =
        action.payload.session?.toPOJO() as unknown as WritableDraft<SessionPOJO>;
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
  updateExerciseWeight,
  setLatestSetTimerNotificationId,
  setCurrentSession,
  updateNotesForExercise,
  updateBodyweight,
} = currentSessionSlice.actions;

export const currentSessionReducer = currentSessionSlice.reducer;
