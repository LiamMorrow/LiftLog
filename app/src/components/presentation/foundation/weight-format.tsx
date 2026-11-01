import { AppText, TextVariant } from '@/components/presentation/foundation/app-text';
import { ColorChoice } from '@/hooks/useAppTheme';
import { shortFormatWeightUnit, Weight } from '@/models/weight';
import { localeDisplayFormatBigNumber } from '@/utils/locale-bignumber';
import { useTranslate } from '@tolgee/react';
import { Text, TextStyle } from 'react-native';

interface WeightFormatProps {
  weight: Weight | undefined;

  /** When set, the weight is the added/assisted load on top of bodyweight, shown as `BW`, `BW +10 kg`, `BW −20 kg`. */
  usesBodyweight?: boolean;
  variant?: TextVariant;
  color?: ColorChoice;
  fontWeight?: TextStyle['fontWeight'];
  decimalPlaces?: number;
}
export default function WeightFormat(props: WeightFormatProps) {
  const { t } = useTranslate();
  const value = props.weight?.value.decimalPlaces(props.decimalPlaces ?? 4);
  const textProps = {
    variant: props.variant,
    color: props.color,
    style: { display: 'flex', alignItems: 'center', flexDirection: 'row', fontWeight: props.fontWeight },
  } as const;

  if (props.usesBodyweight) {
    const label = t('exercise.short_bodyweight.label');
    if (!value || value.isZero()) {
      return <AppText {...textProps}>{label}</AppText>;
    }
    const sign = value.isGreaterThan(0) ? '+' : '';
    return (
      <AppText {...textProps}>
        {label} {sign}
        {localeDisplayFormatBigNumber(value)}{' '}
        <Text style={{ fontSize: 12 }}>{shortFormatWeightUnit(props.weight?.unit)}</Text>
      </AppText>
    );
  }

  const weightDisplay = localeDisplayFormatBigNumber(value) || '-';
  return (
    <AppText {...textProps}>
      {weightDisplay} <Text style={{ fontSize: 12 }}>{shortFormatWeightUnit(props.weight?.unit)}</Text>
    </AppText>
  );
}
