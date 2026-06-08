import { WeightedExerciseBlueprintJSON } from '@/models/storage/versions/v1';
import { fromBigNumberJSON } from '@/models/storage/versions/libs';
import { ProgressiveOverloadJSON } from '@/models/storage/versions/v2';
import { omit } from '@/utils/omit';

export function addProgressiveOverloadToExercise(
  ex: WeightedExerciseBlueprintJSON,
) {
  return {
    ...omit('weightIncreaseOnSuccess', ex),
    progressiveOverload: (fromBigNumberJSON(ex.weightIncreaseOnSuccess).isZero()
      ? { type: 'NoProgressiveOverload' }
      : {
          type: 'IncreaseAllEvenlyProgressiveOverload',
          amount: ex.weightIncreaseOnSuccess,
        }) satisfies ProgressiveOverloadJSON as ProgressiveOverloadJSON,
  };
}
