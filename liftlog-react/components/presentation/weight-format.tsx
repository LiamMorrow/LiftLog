import { SurfaceText } from '@/components/presentation/surface-text';
import { useWeightSuffix } from '@/hooks/useWeightSuffix';
import BigNumber from 'bignumber.js';

interface WeightFormatProps {
  weight: BigNumber | undefined;
  suffixClass?: string;
}
export default function WeightFormat(props: WeightFormatProps) {
  const weightDisplay = props.weight?.decimalPlaces(4).toFormat() ?? '-';
  const suffix = useWeightSuffix();

  return (
    <SurfaceText>
      {weightDisplay}
      <SurfaceText font="text-xs">{suffix}</SurfaceText>
    </SurfaceText>
  );
}
