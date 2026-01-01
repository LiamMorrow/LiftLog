import { LiftLog } from '@/gen/proto';
import { Session } from '@/models/session-models';
import {
  fromSessionDao,
  fromTimestampDao,
} from '@/models/storage/conversions.from-dao';
import {
  toDurationDao,
  toRecordedExerciseDao,
  toSessionDao,
  toTimestampDao,
  toWeightDao,
} from '@/models/storage/conversions.to-dao';
import { Duration, Instant } from '@js-joda/core';
import { match } from 'ts-pattern';

const DaoType = LiftLog.Ui.Models.WorkoutMessage;
type DaoType = typeof LiftLog.Ui.Models.WorkoutMessage;

/**
 * A reflection of the WorkoutMessage Protobuf types.
 * Note that they do NOT need to match 1:1, some events have derived data which we have pre calculated in JS transmitted over the wire
 */
export type WorkoutMessage =
  | WorkoutStartedEvent
  | WorkoutUpdatedEvent
  | WorkoutEndedEvent
  | FinishWorkoutCommand;

export interface WorkoutStartedEvent {
  type: 'WorkoutStartedEvent';
}

export interface WorkoutUpdatedEvent {
  type: 'WorkoutUpdatedEvent';
  workout: Session;
  timerInfo: TimerInfo | undefined;
}

export interface TimerInfo {
  startedAt: Instant;
  partiallyEndAt: Instant;
  endAt: Instant;
}

export interface WorkoutEndedEvent {
  type: 'WorkoutEndedEvent';
}

export interface FinishWorkoutCommand {
  type: 'FinishWorkoutCommand';
}

export function toWorkoutMessageDao(
  message: WorkoutMessage,
  appConfiguration: LiftLog.Ui.Models.WorkoutMessage.AppConfiguration,
  translations: LiftLog.Ui.Models.WorkoutMessage.Translations,
): LiftLog.Ui.Models.WorkoutMessage.WorkoutMessage {
  const messageWithoutTranslation = match(message)
    .returnType<WorkoutMessageWithoutTranslation>()
    .with({ type: 'WorkoutStartedEvent' }, () =>
      createMessage(
        'workoutStartedEvent',
        DaoType.WorkoutStartedEvent.create({}),
      ),
    )
    .with({ type: 'WorkoutUpdatedEvent' }, (e) =>
      createMessage(
        'workoutUpdatedEvent',
        DaoType.WorkoutUpdatedEvent.create({
          workout: toSessionDao(e.workout),
          currentExercise: e.workout.nextExercise
            ? toRecordedExerciseDao(e.workout.nextExercise)
            : null,
          timerInfo: e.timerInfo
            ? {
                startedAt: toTimestampDao(e.timerInfo.startedAt),
                partiallyEndAt: toTimestampDao(e.timerInfo.partiallyEndAt),
                endAt: toTimestampDao(e.timerInfo.endAt),
              }
            : null,
          totalWeightLifted: toWeightDao(e.workout.totalWeightLifted),
          workoutDuration: toDurationDao(e.workout.duration ?? Duration.ZERO),
        }),
      ),
    )
    .with({ type: 'WorkoutEndedEvent' }, () =>
      createMessage('workoutEndedEvent', DaoType.WorkoutEndedEvent.create({})),
    )
    .with({ type: 'FinishWorkoutCommand' }, () =>
      createMessage(
        'finishWorkoutCommand',
        DaoType.FinishWorkoutCommand.create({}),
      ),
    )
    .exhaustive();

  return DaoType.WorkoutMessage.create({
    ...messageWithoutTranslation,
    translations,
    appConfiguration,
  });
}

export function fromWorkoutMessageDao(
  event: LiftLog.Ui.Models.WorkoutMessage.WorkoutMessage,
): WorkoutMessage {
  return match(event.payload)
    .returnType<WorkoutMessage>()
    .with('workoutStartedEvent', () => ({
      type: 'WorkoutStartedEvent',
    }))
    .with('workoutUpdatedEvent', () => ({
      type: 'WorkoutUpdatedEvent',
      workout: fromSessionDao(event.workoutUpdatedEvent!.workout),
      timerInfo: event.workoutUpdatedEvent?.timerInfo
        ? {
            startedAt: fromTimestampDao(
              event.workoutUpdatedEvent.timerInfo.startedAt,
            ),
            partiallyEndAt: fromTimestampDao(
              event.workoutUpdatedEvent.timerInfo.partiallyEndAt,
            ),
            endAt: fromTimestampDao(event.workoutUpdatedEvent.timerInfo.endAt),
          }
        : undefined,
    }))
    .with('workoutEndedEvent', () => ({
      type: 'WorkoutEndedEvent',
    }))
    .with('finishWorkoutCommand', () => ({ type: 'FinishWorkoutCommand' }))
    .with(undefined, () => {
      throw new Error('Malformed WorkoutEvent, undefined');
    })
    .exhaustive();
}

type WorkoutMessageWithoutTranslation = Omit<
  LiftLog.Ui.Models.WorkoutMessage.IWorkoutMessage,
  'translations'
>;

function createMessage<
  T extends keyof LiftLog.Ui.Models.WorkoutMessage.IWorkoutMessage,
>(
  type: T,
  value: LiftLog.Ui.Models.WorkoutMessage.IWorkoutMessage[T],
): WorkoutMessageWithoutTranslation {
  return { [type]: value };
}

function toWorkoutUpdatedMessageDao();
