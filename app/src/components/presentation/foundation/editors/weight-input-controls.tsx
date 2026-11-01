import { NumberInput } from '@/components/presentation/foundation/editors/number-inputs';
import SelectPicker from '@/components/presentation/foundation/select-picker';
import IconButton from '@/components/presentation/foundation/icon-button';
import { spacing } from '@/hooks/useAppTheme';
import { shortFormatWeightUnit, Weight, WeightUnit } from '@/models/weight';
import { useTranslate } from '@tolgee/react';
import { View } from 'react-native';

const units: WeightUnit[] = ['kilograms', 'pounds'];

export function WeightInputControls(props: {
  text: string;
  onChangeText: (text: string) => void;
  unit: WeightUnit;
  onUnitChange: (unit: WeightUnit) => void;
  onIncrement: () => void;
  onDecrement: () => void;
  autoFocus?: boolean;
}) {
  const { t } = useTranslate();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
      <IconButton icon="minus" mode="contained-tonal" size={28} testID="decrement-weight" onPress={props.onDecrement} />
      <NumberInput
        testID="weight-input"
        size="large"
        value={props.text}
        onChangeText={props.onChangeText}
        keyboardType="decimal-pad"
        accessibilityLabel={t('weight.weight.label')}
        autoFocus={props.autoFocus}
        flex={1}
      />
      <SelectPicker
        testID="weight-unit"
        value={props.unit}
        options={units.map((unit) => ({ value: unit, label: shortFormatWeightUnit(unit) }))}
        onChange={props.onUnitChange}
      />
      <IconButton icon="plus" mode="contained-tonal" size={28} testID="increment-weight" onPress={props.onIncrement} />
    </View>
  );
}

export function NegateWeightButton(props: { weight: Weight | undefined; onChange: (weight: Weight) => void }) {
  const { t } = useTranslate();
  const { weight } = props;
  return (
    <IconButton
      icon="plusMinus"
      mode="contained-tonal"
      accessibilityLabel={t('exercise.toggle_negative.button')}
      disabled={!weight || weight.value.isZero()}
      onPress={() => weight && props.onChange(new Weight(weight.value.negated(), weight.unit))}
    />
  );
}
