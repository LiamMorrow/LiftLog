import { FixedRepsConfigJSON, RepsConfigJSON } from '@/models/storage/versions/latest';
import { omit } from '@/utils/omit';

/**
 * Replaces the scalar `repsPerSet` on a weighted exercise with a `repsConfig`
 * discriminated union. All pre-existing data is a single fixed target.
 */
export function repsPerSetToRepsConfig<T extends { repsPerSet: number }>(ex: T) {
  return {
    ...omit('repsPerSet', ex),
    repsConfig: { type: 'fixed' as const, reps: ex.repsPerSet } satisfies FixedRepsConfigJSON as RepsConfigJSON,
  };
}
