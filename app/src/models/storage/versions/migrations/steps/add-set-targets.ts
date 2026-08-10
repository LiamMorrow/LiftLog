import type { OffsetDateTimeJSON } from '@/models/storage/versions/libs';
import type { WeightJSON } from '@/models/storage/versions/libs/weight';

/*
 * Shapes frozen at the version this step was written for. Step files never import from `latest/` -
 * see docs/Migrations.md.
 */

interface RepsTarget {
  min: number;
  max: number;
}

interface PlannedSet {
  reps: RepsTarget;
}

interface RecordedSet {
  repsCompleted: number;
  completionDateTime: OffsetDateTimeJSON;
}

interface PotentialSet {
  set?: RecordedSet | undefined;
  weight: WeightJSON;
}

interface Input {
  blueprint: { plannedSets: PlannedSet[] };
  potentialSets: PotentialSet[];
}

/** Gives each recorded set the target it was chasing, so the target can carry to the next session. */
export function addSetTargets<T extends Input>(ex: T) {
  const { potentialSets, ...rest } = ex;
  const { plannedSets } = ex.blueprint;
  return {
    ...rest,
    potentialSets: potentialSets.map((ps, index) => ({
      ...ps,
      // A session can hold more sets than its blueprint plans - both the mid-workout edit and the
      // next-session build size the list from the previous performance.
      target: targetAt(plannedSets, index),
    })),
  };
}

function targetAt(plannedSets: PlannedSet[], index: number): PlannedSet {
  const target = plannedSets[index]?.reps ?? plannedSets.at(-1)?.reps ?? { min: 0, max: 0 };
  return { reps: { min: target.min, max: target.max } };
}
