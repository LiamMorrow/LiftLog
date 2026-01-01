import { LiftLog } from '@/gen/proto';
import { Session } from '@/models/session-models';
import {
  fromSessionDao,
  fromTimestampDao,
} from '@/models/storage/conversions.from-dao';
import {
  toSessionDao,
  toTimestampDao,
} from '@/models/storage/conversions.to-dao';
import { Instant } from '@js-joda/core';
import { match } from 'ts-pattern';

const DaoType = LiftLog.Ui.Models.WorkoutEvent;
type DaoType = typeof LiftLog.Ui.Models.WorkoutEvent;

export type WorkoutEvent =
  | WorkoutStarted
  | WorkoutUpdated
  | WorkoutEnded
  | ExerciseSetCompleted;

export interface WorkoutStarted {
  type: 'WorkoutStarted';
  workout: Session;
}

export interface WorkoutUpdated {
  type: 'WorkoutUpdated';
  workout: Session;
}

export interface WorkoutEnded {
  type: 'WorkoutEnded';
}

export interface ExerciseSetCompleted {
  type: 'TimerStarted';
  startedAt: Instant;
  partiallyEndAt: Instant;
  endAt: Instant;
}

export function toWorkoutEventDao(
  event: WorkoutEvent,
): LiftLog.Ui.Models.WorkoutEvent.WorkoutEvent {
  return DaoType.WorkoutEvent.create(
    match(event)
      .with({ type: 'WorkoutStarted' }, (e) => ({
        workoutStarted: DaoType.WorkoutStarted.create({
          workout: toSessionDao(e.workout),
        }),
      }))
      .with({ type: 'WorkoutUpdated' }, (e) => ({
        workoutUpdated: DaoType.WorkoutUpdated.create({
          workout: toSessionDao(e.workout),
        }),
      }))
      .with({ type: 'WorkoutEnded' }, (e) => ({
        workoutEnded: DaoType.WorkoutEnded.create({}),
      }))
      .with({ type: 'TimerStarted' }, (e) => ({
        timerStarted: DaoType.TimerStarted.create({
          startedAt: toTimestampDao(e.startedAt),
          partiallyEndAt: toTimestampDao(e.partiallyEndAt),
          endAt: toTimestampDao(e.endAt + 1),
        }),
      }))
      .exhaustive(),
  );
}

export function fromWorkoutEventDao(
  event: LiftLog.Ui.Models.WorkoutEvent.WorkoutEvent,
): WorkoutEvent {
  return match(event.eventPayload)
    .returnType<WorkoutEvent>()
    .with('workoutStarted', () => ({
      type: 'WorkoutStarted' as const,
      workout: fromSessionDao(event.workoutStarted!.workout),
    }))
    .with('workoutUpdated', () => ({
      type: 'WorkoutUpdated' as const,
      workout: fromSessionDao(event.workoutUpdated!.workout),
    }))
    .with('workoutEnded', () => ({
      type: 'WorkoutEnded' as const,
    }))
    .with('timerStarted', () => ({
      type: 'TimerStarted' as const,
      startedAt: fromTimestampDao(event.timerStarted?.startedAt),
      partiallyEndAt: fromTimestampDao(event.timerStarted?.partiallyEndAt),
      endAt: fromTimestampDao(event.timerStarted?.endAt),
    }))
    .with(undefined, () => {
      throw new Error('Malformed WorkoutEvent, undefined');
    })
    .exhaustive();
}
