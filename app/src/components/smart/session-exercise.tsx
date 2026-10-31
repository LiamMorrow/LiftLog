import {
  RecordedCardioExercise,
  RecordedCardioExerciseSet,
  RecordedExercise,
  RecordedWeightedExercise,
  Session,
} from '@/models/session-models';
import { Updater } from '@/utils/types';
import WeightedExercise from '@/components/presentation/workout/weighted/weighted-exercise';
import { CardioExercise } from '@/components/presentation/workout/cardio/cardio-exercise';
import { SupersetBadge } from '@/components/presentation/workout/superset-group';
import { getSessionExerciseEditorHref } from '@/components/smart/session-exercise-editor';
import { LocalDate, LocalTime, OffsetDateTime, ZoneId } from '@js-joda/core';
import { useRouter } from 'expo-router';
import { memo } from 'react';
import { match, P } from 'ts-pattern';

export type SessionUpdater = (update: (session: Session) => Session) => void;

// Both the set's own tiles and the docked clock write through here, so a set earns its rest
// whichever way it was filled in.
export function updateCardioSet(
  updateSession: SessionUpdater,
  exerciseIndex: number,
  setIndex: number,
  update: Updater<RecordedCardioExerciseSet>,
) {
  const now = OffsetDateTime.now();
  updateSession((s) => {
    const before = s.cardioSetAt(exerciseIndex, setIndex);
    const updated = s.withCardioSet(exerciseIndex, setIndex, update, now);
    return updated.cardioSetAt(exerciseIndex, setIndex)?.earnsRest(before)
      ? updated.withRestTimerAt(updated.lastExercise?.latestTime)
      : updated;
  });
}

interface SessionExerciseProps {
  exercise: RecordedExercise;
  index: number;
  exerciseCount: number;
  supersetLabel: string | undefined;
  toStartNext: boolean;
  isReadonly: boolean;
  isActiveWorkout: boolean;
  editableSessionId: string | undefined;
  sessionDate: LocalDate;
  /** Only for a session being edited after the fact, where new sets are stamped from its last one. */
  lastCompletedAt: OffsetDateTime | undefined;
  previousLineageExercise: RecordedExercise | undefined;
  updateSession: SessionUpdater;
}

// Memoised by hand: the list is built in a loop, which the compiler does not memoise per item, and a change
// to one set would otherwise re-render every exercise in the workout.
export const SessionExercise = memo(function SessionExercise(props: SessionExerciseProps) {
  const { index, updateSession, editableSessionId, isReadonly } = props;
  const { push } = useRouter();
  const titleLeading = props.supersetLabel && <SupersetBadge label={props.supersetLabel} />;
  const onEditExercise = editableSessionId
    ? () => push(getSessionExerciseEditorHref(editableSessionId, index))
    : undefined;
  const onRemoveExercise = () => updateSession((s) => s.withRemovedExercise(index));
  const onMoveExerciseUp =
    !isReadonly && index > 0 ? () => updateSession((s) => s.withExerciseMovedUp(index)) : undefined;
  const onMoveExerciseDown =
    !isReadonly && index < props.exerciseCount - 1
      ? () => updateSession((s) => s.withExerciseMovedDown(index))
      : undefined;

  return match(props.exercise)
    .with(P.instanceOf(RecordedWeightedExercise), (exercise) => (
      <WeightedExercise
        titleLeading={titleLeading}
        timeProvider={() =>
          props.isActiveWorkout
            ? OffsetDateTime.now()
            : (props.lastCompletedAt ??
              props.sessionDate.atTime(LocalTime.now()).atZone(ZoneId.systemDefault()).toOffsetDateTime())
        }
        recordedExercise={exercise}
        toStartNext={props.toStartNext}
        updateExercise={(update) =>
          updateSession((s) => {
            const updated = s.withExercise(index, update(s.recordedExercises[index] as RecordedWeightedExercise));
            return updated.hasSameLatestCompletion(s)
              ? updated
              : updated.withRestTimerAt(updated.lastExercise?.latestTime);
          })
        }
        onEditExercise={onEditExercise}
        onRemoveExercise={onRemoveExercise}
        onMoveExerciseUp={onMoveExerciseUp}
        onMoveExerciseDown={onMoveExerciseDown}
        isReadonly={isReadonly}
        showPreviousButton={props.isActiveWorkout}
        previousLineageExercise={props.previousLineageExercise as RecordedWeightedExercise | undefined}
      />
    ))
    .with(P.instanceOf(RecordedCardioExercise), (exercise) => (
      <CardioExercise
        titleLeading={titleLeading}
        recordedExercise={exercise}
        updateExercise={(update) =>
          updateSession((s) => s.withExercise(index, update(s.recordedExercises[index] as RecordedCardioExercise)))
        }
        updateSet={(setIndex, update) => updateCardioSet(updateSession, index, setIndex, update)}
        onStartTimer={(setIndex) =>
          updateSession((s) => s.withCardioTimerStarted(index, setIndex, OffsetDateTime.now()))
        }
        toStartNext={props.toStartNext}
        onEditExercise={onEditExercise}
        onRemoveExercise={onRemoveExercise}
        onMoveExerciseUp={onMoveExerciseUp}
        onMoveExerciseDown={onMoveExerciseDown}
        isReadonly={isReadonly}
        showPreviousButton={props.isActiveWorkout}
        previousLineageExercise={props.previousLineageExercise as RecordedCardioExercise | undefined}
      />
    ))
    .exhaustive();
});
