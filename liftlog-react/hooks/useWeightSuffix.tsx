import { useAppSelector } from '@/store';

export function useWeightSuffix() {
  const useImperial = useAppSelector((x) => x.settings.useImperialUnits);
  return useImperial ? 'lbs' : 'kg';
}
