import { omit } from '@/utils/omit';

interface RepsTarget {
  min: number;
  max: number;
}

type RepsConfig =
  | { type: 'fixed'; reps: number }
  | { type: 'range'; min: number; max: number }
  | { type: 'perSet'; targets: RepsTarget[] };

/**
 * Replaces the scalar `repsPerSet` on a weighted exercise with a `repsConfig`
 * discriminated union. All pre-existing data is a single fixed target.
 */
export function repsPerSetToRepsConfig<T extends { repsPerSet: number }>(ex: T) {
  return {
    ...omit('repsPerSet', ex),
    repsConfig: { type: 'fixed' as const, reps: ex.repsPerSet } as RepsConfig,
  };
}
