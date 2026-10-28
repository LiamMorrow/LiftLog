import { RepsStripSet } from '@/components/presentation/workout/reps-strip';
import { formatRepsTarget } from '@/models/blueprint-models';
import { RecordedWeightedExercise } from '@/models/session-models';
import { Weight } from '@/models/weight';
import { consecutiveRuns } from '@/utils/consecutive-runs';

export type SummarySetRun = { weight: Weight; sets: RepsStripSet[] };

export function summarySetRuns(
  exercise: RecordedWeightedExercise,
  options: { isFilled: boolean; groupByWeight: boolean },
): SummarySetRun[] {
  const sets = exercise.potentialSets.flatMap((potentialSet, index) => {
    if (potentialSet.set) {
      return [{ weight: potentialSet.weight, label: potentialSet.set.repsCompleted.toString(), isDone: true }];
    }
    if (options.isFilled) {
      return [];
    }
    return [{ weight: potentialSet.weight, label: formatRepsTarget(exercise.repsTargetForSet(index)), isDone: false }];
  });

  return consecutiveRuns(sets, (previous, next) => !options.groupByWeight || previous.weight.equals(next.weight)).map(
    (run) => ({
      weight: run[0]!.weight,
      sets: run.map(({ label, isDone }) => ({ label, isDone })),
    }),
  );
}
