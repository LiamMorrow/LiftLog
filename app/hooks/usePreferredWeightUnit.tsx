import { WeightUnit } from '@/models/weight';
import { useAppSelector } from '@/store';

export function usePreferredWeightUnit(): WeightUnit {
  const useImperial = useAppSelector((x) => x.settings.useImperialUnits);
  return useImperial ? 'pounds' : 'kilograms';
}

export function usePreferredWeightSuffix(): 'kg' | 'lbs' {
  const useImperial = useAppSelector((x) => x.settings.useImperialUnits);
  return useImperial ? 'lbs' : 'kg';
}
