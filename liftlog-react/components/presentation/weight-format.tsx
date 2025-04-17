import { useAppTheme } from '@/hooks/useAppTheme';
import { useWeightSuffix } from '@/hooks/useWeightSuffix';
import BigNumber from 'bignumber.js';
import { Text } from 'react-native';

interface WeightFormatProps {
  weight: BigNumber | undefined;
  color?: string;
}
export default function WeightFormat(props: WeightFormatProps) {
  const weightDisplay = props.weight?.decimalPlaces(4).toFormat() ?? '-';
  const suffix = useWeightSuffix();
  const { colors } = useAppTheme();

  return (
    <Text
      style={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
        color: props.color ?? colors.onSurface,
      }}
    >
      {weightDisplay}
      <Text style={{ fontSize: 12 }}>{suffix}</Text>
    </Text>
  );
}
