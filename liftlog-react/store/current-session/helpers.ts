import { ExerciseBlueprint } from '@/models/blueprint-models';
import { RecordedSet } from '@/models/session-models';
import { LocalDateTime } from '@js-joda/core';
import { match } from 'ts-pattern';

export function getCycledRepCount(
  recordedSet: RecordedSet | undefined,
  exerciseBlueprint: ExerciseBlueprint,
  time: LocalDateTime,
): RecordedSet | undefined {
  return match(recordedSet)
    .returnType<RecordedSet | undefined>()
    .with(undefined, () => ({
      completionDateTime: time,
      repsCompleted: exerciseBlueprint.repsPerSet,
    }))
    .with({ repsCompleted: 0 }, () => undefined)
    .otherwise((x) => ({
      ...x,
      repsCompleted: x.repsCompleted - 1,
    }));
}
