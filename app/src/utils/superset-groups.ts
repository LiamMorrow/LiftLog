import { RecordedExercise, RecordedWeightedExercise } from '@/models/session-models';
import { consecutiveRuns } from '@/utils/consecutive-runs';

export interface ExerciseGroup {
  isSuperset: boolean;
  members: { index: number; label: string | undefined }[];
}

export function groupSupersets(exercises: readonly RecordedExercise[]): ExerciseGroup[] {
  const supersetsWithNext = (index: number) => {
    const exercise = exercises[index];
    return exercise instanceof RecordedWeightedExercise && exercise.blueprint.supersetWithNext;
  };
  const runs = consecutiveRuns(
    exercises.map((_, index) => index),
    (previous) => supersetsWithNext(previous),
  );

  let supersetCount = 0;
  return runs.map((run) => {
    if (run.length === 1) {
      return { isSuperset: false, members: [{ index: run[0]!, label: undefined }] };
    }
    const letter = String.fromCharCode('A'.charCodeAt(0) + supersetCount++);
    return {
      isSuperset: true,
      members: run.map((index, position) => ({ index, label: `${letter}${position + 1}` })),
    };
  });
}
