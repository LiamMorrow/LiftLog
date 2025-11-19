import { WeightUnit } from '@/models/weight';
import { useAppSelector } from '@/store';

export function usePreferredWeightUnit(): WeightUnit {
  const useImperial = useAppSelector((x) => x.settings.useImperialUnits);
  return useImperial ? 'pounds' : 'kilograms';
}
