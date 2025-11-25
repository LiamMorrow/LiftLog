import {
  ColorChoice,
  font,
  FontChoice,
  useAppTheme,
} from '@/hooks/useAppTheme';
import { shortFormatWeightUnit, Weight } from '@/models/weight';
import { localeFormatBigNumber } from '@/utils/locale-bignumber';
import { Text, TextStyle } from 'react-native';

interface WeightFormatProps {
  weight: Weight | undefined;

  fontSize?: FontChoice;
  color?: ColorChoice;
  fontWeight?: TextStyle['fontWeight'];
}
export default function WeightFormat(props: WeightFormatProps) {
  const weightDisplay =
    localeFormatBigNumber(props.weight?.value.decimalPlaces(4)) || '-';
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
      <Text style={{ fontSize: 12 }}>
        {shortFormatWeightUnit(props.weight?.unit)}
      </Text>
    </Text>
  );
}
