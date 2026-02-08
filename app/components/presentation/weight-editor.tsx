import { spacing } from '@/hooks/useAppTheme';
import {
  localeFormatBigNumber,
  localeParseBigNumber,
} from '@/utils/locale-bignumber';
import { useTranslate } from '@tolgee/react';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import IconButton from '@/components/presentation/gesture-wrappers/icon-button';
import { TextInput, Tooltip, useTheme } from 'react-native-paper';
import { Weight, WeightUnit } from '@/models/weight';
import SelectButton from '@/components/presentation/select-button';
import { usePreferredWeightUnit } from '@/hooks/usePreferredWeightUnit';

type WeightEditorProps = {
  increment: BigNumber;
  label?: string;
  allowNegative?: boolean | undefined;
} & (
  | {
      weight: Weight;
      updateWeight: (weight: Weight) => void;
      allowNull?: false;
    }
  | {
      weight: Weight | undefined;
      updateWeight: (weight: Weight | undefined) => void;
      allowNull: true;
    }
);

export function WeightEditor(props: WeightEditorProps) {
  const theme = useTheme();
  const { t } = useTranslate();
  const preferredWeightUnit = usePreferredWeightUnit();
  const [text, setText] = useState(localeFormatBigNumber(props.weight?.value));
  const [editorWeightValue, setEditorWeightValue] = useState<
    BigNumber | undefined
  >(props.weight?.value);
  const [editorWeightUnit, setEditorWeightUnit] = useState<WeightUnit>(
    props.weight?.unit ?? preferredWeightUnit,
  );

  useEffect(() => {
    setText(localeFormatBigNumber(props.weight?.value));
    setEditorWeightValue(props.weight?.value);
    setEditorWeightUnit(props.weight?.unit ?? preferredWeightUnit);
  }, [preferredWeightUnit, props.weight]);

  const nonZeroIncrement = props.increment.isZero()
    ? new BigNumber('2.5')
    : props.increment;

  const incrementWeight = () => {
    if (editorWeightValue === undefined) {
      return;
    }
    setEditorWeightValue(editorWeightValue.plus(nonZeroIncrement));
    setText(localeFormatBigNumber(editorWeightValue.plus(nonZeroIncrement)));
    emitCurrentValues(
      editorWeightValue.plus(nonZeroIncrement),
      editorWeightUnit,
    );
  };
  const decrementWeight = () => {
    if (editorWeightValue === undefined) {
      return;
    }
    if (
      !props.allowNegative &&
      editorWeightValue.isLessThan(nonZeroIncrement)
    ) {
      return;
    }
    setEditorWeightValue(editorWeightValue.minus(nonZeroIncrement));
    setText(localeFormatBigNumber(editorWeightValue.minus(nonZeroIncrement)));
    emitCurrentValues(
      editorWeightValue.minus(nonZeroIncrement),
      editorWeightUnit,
    );
  };

  const handleTextChange = (text: string) => {
    setText(text);
    if (text.trim() === '') {
      setEditorWeightValue(undefined);
      emitCurrentValues(undefined, editorWeightUnit);
      return;
    }

    if (!localeParseBigNumber(text).isNaN()) {
      setEditorWeightValue(localeParseBigNumber(text));
      emitCurrentValues(localeParseBigNumber(text), editorWeightUnit);
      return;
    }
  };

  const emitCurrentValues = (
    editorWeightValue: BigNumber | undefined,
    editorWeightUnit: WeightUnit,
  ) => {
    if (editorWeightValue === undefined && !props.allowNull) {
      return;
    }
    if (!props.allowNegative && editorWeightValue?.isLessThan(0)) {
      return;
    }
    if (!editorWeightValue) {
      props.updateWeight(undefined!);
    } else {
      props.updateWeight(new Weight(editorWeightValue, editorWeightUnit));
    }
  };

  return (
    <View style={{ gap: spacing[2] }}>
      <View
        style={{
          flexDirection: 'row',
          gap: spacing[2],
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <TextInput
          testID="weight-input"
          selectTextOnFocus
          mode="outlined"
          inputMode="decimal"
          keyboardType="decimal-pad"
          autoFocus
          value={text}
          onChangeText={handleTextChange}
          style={{
            backgroundColor: theme.colors.elevation.level3,
            flex: 1,
          }}
        />

        <SelectButton
          testID="weight-dialog-unit-selector"
          options={[
            { label: 'kg', value: 'kilograms' },
            { label: 'lbs', value: 'pounds' },
            { label: 'Unit', value: 'nil', disabledAndHidden: true },
          ]}
          value={editorWeightUnit}
          onChange={(unit) => {
            setEditorWeightUnit(unit);
            emitCurrentValues(editorWeightValue, unit);
          }}
        />
      </View>
      <View
        style={{
          flexDirection: 'row',
          gap: spacing[2],
          alignItems: 'center',
        }}
      >
        {props.allowNegative && (
          <Tooltip title={t('exercise.toggle_negative.button')}>
            <IconButton
              mode="outlined"
              icon={'plusMinus'}
              onPress={() => {
                setEditorWeightValue(editorWeightValue?.multipliedBy(-1));
                setText(
                  localeFormatBigNumber(editorWeightValue?.multipliedBy(-1)),
                );
                emitCurrentValues(
                  editorWeightValue?.multipliedBy(-1),
                  editorWeightUnit,
                );
              }}
            />
          </Tooltip>
        )}
        <IconButton
          icon={'minus'}
          mode="outlined"
          testID="decrement-weight"
          onPress={decrementWeight}
        />
        <IconButton
          icon={'plus'}
          mode="outlined"
          testID="increment-weight"
          onPress={incrementWeight}
        />
      </View>
    </View>
  );
}
