import { useSelector } from '@/store';

export function useWeightSuffix() {
  const useImperial = useSelector((x) => x.settings.useImperialUnits);
  return useImperial ? 'lbs' : 'kg';
}
