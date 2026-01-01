import { LiftLog } from '@/gen/proto';
import { Session } from '@/models/session-models';
import {
  fromDurationDao,
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
  restTimerInfo: RestTimerInfo | undefined;
  cardioTimerInfo: CardioTimerInfo | undefined;
}

export interface CardioTimerInfo {
  currentDuration: Duration;
  currentBlockStartTime: Instant | undefined;
}

export interface RestTimerInfo {
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
          restTimerInfo: e.restTimerInfo
            ? {
                startedAt: toTimestampDao(e.restTimerInfo.startedAt),
                partiallyEndAt: toTimestampDao(e.restTimerInfo.partiallyEndAt),
                endAt: toTimestampDao(e.restTimerInfo.endAt),
              }
            : null,
          cardioTimerInfo: e.cardioTimerInfo
            ? {
                currentDuration: toDurationDao(
                  e.cardioTimerInfo.currentDuration,
                ),
                currentBlockStartTime: e.cardioTimerInfo.currentBlockStartTime
                  ? toTimestampDao(e.cardioTimerInfo.currentBlockStartTime)
                  : null,
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
      restTimerInfo: event.workoutUpdatedEvent?.restTimerInfo
        ? {
            startedAt: fromTimestampDao(
              event.workoutUpdatedEvent.restTimerInfo.startedAt,
            ),
            partiallyEndAt: fromTimestampDao(
              event.workoutUpdatedEvent.restTimerInfo.partiallyEndAt,
            ),
            endAt: fromTimestampDao(
              event.workoutUpdatedEvent.restTimerInfo.endAt,
            ),
          }
        : undefined,
      cardioTimerInfo: event.workoutUpdatedEvent?.cardioTimerInfo
        ? {
            currentBlockStartTime: event.workoutUpdatedEvent.cardioTimerInfo
              .currentBlockStartTime
              ? fromTimestampDao(
                  event.workoutUpdatedEvent.cardioTimerInfo
                    .currentBlockStartTime,
                )
              : undefined,
            currentDuration: fromDurationDao(
              event.workoutUpdatedEvent.cardioTimerInfo.currentBlockStartTime,
            )!,
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
