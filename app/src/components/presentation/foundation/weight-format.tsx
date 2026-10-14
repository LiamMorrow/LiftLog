import { ColorChoice, font, FontChoice, useAppTheme } from '@/hooks/useAppTheme';
import { shortFormatWeightUnit, Weight } from '@/models/weight';
import { localeFormatBigNumber } from '@/utils/locale-bignumber';
import { useTranslate } from '@tolgee/react';
import { Text, TextStyle } from 'react-native';

interface WeightFormatProps {
  weight: Weight | undefined;

  /** When set, the weight is the added/assisted load on top of bodyweight, shown as `BW`, `BW +10 kg`, `BW −20 kg`. */
  usesBodyweight?: boolean;
  fontSize?: FontChoice;
  color?: ColorChoice;
  fontWeight?: TextStyle['fontWeight'];
  decimalPlaces?: number;
}
export default function WeightFormat(props: WeightFormatProps) {
  const { t } = useTranslate();
  const { colors } = useAppTheme();
  const value = props.weight?.value.decimalPlaces(props.decimalPlaces ?? 4);
  const style = {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    color: colors[props.color ?? 'onSurface'],
    fontWeight: props.fontWeight,
    ...(props.fontSize ? { ...font[props.fontSize] } : undefined),
  } as const;

  if (props.usesBodyweight) {
    const label = t('exercise.short_bodyweight.label');
    if (!value || value.isZero()) {
      return <Text style={style}>{label}</Text>;
    }
    const sign = value.isGreaterThan(0) ? '+' : '';
    return (
      <Text style={style}>
        {label} {sign}
        {localeFormatBigNumber(value)} <Text style={{ fontSize: 12 }}>{shortFormatWeightUnit(props.weight?.unit)}</Text>
      </Text>
    );
  }

  const weightDisplay = localeFormatBigNumber(value) || '-';
  return (
    <Text style={style}>
      {weightDisplay} <Text style={{ fontSize: 12 }}>{shortFormatWeightUnit(props.weight?.unit)}</Text>
    </Text>
  );
}
