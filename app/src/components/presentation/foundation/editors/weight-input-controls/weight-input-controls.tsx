import { NumberInput } from '@/components/presentation/foundation/editors/number-inputs';
import SelectPicker from '@/components/presentation/foundation/select-picker';
import { NativeIconButton } from '@/components/presentation/foundation/native-icon-button';
import { NativeButton } from '@/components/presentation/foundation/native-button';
import RemoveIcon from '@expo/material-symbols/remove.xml';
import AddIcon from '@expo/material-symbols/add.xml';
import ExposureIcon from '@expo/material-symbols/exposure.xml';
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
      <NativeIconButton
        icon={RemoveIcon}
        systemImage="minus"
        variant="tonal"
        iconSize={28}
        testID="decrement-weight"
        label={t('generic.decrease.button')}
        onPress={props.onDecrement}
      />
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
      <NativeIconButton
        icon={AddIcon}
        systemImage="plus"
        variant="tonal"
        iconSize={28}
        testID="increment-weight"
        label={t('generic.increase.button')}
        onPress={props.onIncrement}
      />
    </View>
  );
}

export function NegateWeightButton(props: { weight: Weight | undefined; onChange: (weight: Weight) => void }) {
  const { t } = useTranslate();
  const { weight } = props;
  return (
    <NativeButton
      icon={ExposureIcon}
      systemImage="plusminus"
      variant="tonal"
      floating
      label={t('exercise.toggle_negative.button')}
      onPress={() => weight && props.onChange(new Weight(weight.value.negated(), weight.unit))}
    />
  );
}
