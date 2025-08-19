import {
  ColorChoice,
  font,
  FontChoice,
  useAppTheme,
} from '@/hooks/useAppTheme';
import { useWeightSuffix } from '@/hooks/useWeightSuffix';
import { localeFormatBigNumber } from '@/utils/locale-bignumber';
import BigNumber from 'bignumber.js';
import { Text, TextStyle } from 'react-native';

interface WeightFormatProps {
  weight: BigNumber | undefined;

  fontSize?: FontChoice;
  color?: ColorChoice;
  fontWeight?: TextStyle['fontWeight'];
}
export default function WeightFormat(props: WeightFormatProps) {
  const weightDisplay =
    localeFormatBigNumber(props.weight?.decimalPlaces(4)) || '-';
  const suffix = useWeightSuffix();
  const { colors } = useAppTheme();

  return (
    <Text
      style={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
        color: colors[props.color ?? 'onSurface'],
        fontWeight: props.fontWeight,
        ...(props.fontSize ? { ...font[props.fontSize] } : undefined),
      }}
    >
      {weightDisplay}
      <Text style={{ fontSize: 12 }}>{suffix}</Text>
    </Text>
  );
}
