interface RepsTarget {
  min: number;
  max: number;
}

type RepsConfig =
  | { type: 'fixed'; reps: number }
  | { type: 'range'; min: number; max: number }
  | { type: 'perSet'; targets: RepsTarget[] };

interface PlannedSet {
  reps: RepsTarget;
}

type Resistance = 'none' | 'external' | 'bodyweight';

interface Input {
  sets: number;
  repsConfig: RepsConfig;
  usesBodyweight: boolean;
}

/**
 * Replaces `sets` + `repsConfig` with a plain list of planned sets, and `usesBodyweight` with a
 * three-way `resistance`.
 */
export function repsConfigToPlannedSets<T extends Input>(ex: T) {
  const { sets, repsConfig, usesBodyweight, ...rest } = ex;
  return {
    ...rest,
    plannedSets: plannedSetsFor(sets, repsConfig),
    resistance: (usesBodyweight ? 'bodyweight' : 'external') as Resistance,
  };
}

function plannedSetsFor(sets: number, repsConfig: RepsConfig): PlannedSet[] {
  if (repsConfig.type === 'fixed') {
    return targetRepeated(sets, { min: repsConfig.reps, max: repsConfig.reps });
  }
  if (repsConfig.type === 'range') {
    return targetRepeated(sets, { min: repsConfig.min, max: repsConfig.max });
  }
  // A per-set list can be shorter or longer than the set count, so each index resolves the way
  // `repsTargetForSet` resolved it.
  const last = repsConfig.targets.at(-1);
  return targetsFrom(sets, (index) => repsConfig.targets[index] ?? last ?? { min: 0, max: 0 });
}

function targetRepeated(sets: number, target: RepsTarget): PlannedSet[] {
  return targetsFrom(sets, () => target);
}

function targetsFrom(sets: number, target: (index: number) => RepsTarget): PlannedSet[] {
  return Array.from({ length: Math.max(sets, 0) }, (_, index) => {
    const { min, max } = target(index);
    return { reps: { min, max } };
  });
}
