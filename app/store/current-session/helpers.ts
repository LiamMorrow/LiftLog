import { ExerciseBlueprintPOJO } from '@/models/session-models';
import { RecordedSetPOJO } from '@/models/session-models';
import { LocalDateTime } from '@js-joda/core';
import { match } from 'ts-pattern';

export function getCycledRepCount(
  recordedSet: RecordedSetPOJO | undefined,
  exerciseBlueprint: ExerciseBlueprintPOJO,
  time: LocalDateTime,
): RecordedSetPOJO | undefined {
  return match(recordedSet)
    .returnType<RecordedSetPOJO | undefined>()
    .with(undefined, () => ({
      _BRAND: 'RECORDED_SET_POJO',
      completionDateTime: time,
      repsCompleted: exerciseBlueprint.repsPerSet,
    }))
    .with({ repsCompleted: 0 }, () => undefined)
    .otherwise((x) => ({
      ...x,
      repsCompleted: x.repsCompleted - 1,
    }));
}
