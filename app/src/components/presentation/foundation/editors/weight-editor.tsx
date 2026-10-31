import { localeFormatBigNumber, localeParseBigNumber } from '@/utils/locale-bignumber';
import BigNumber from 'bignumber.js';
import { WeightInputControls } from '@/components/presentation/foundation/editors/weight-input-controls';
import { Weight, WeightUnit } from '@/models/weight';
import { usePreferredWeightUnit } from '@/hooks/usePreferredWeightUnit';
import { useDerivedState } from '@/hooks/useDerivedState';

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
  const preferredWeightUnit = usePreferredWeightUnit();
  const [text, setText] = useDerivedState(props.weight?.value, (weight) => localeFormatBigNumber(weight));
  const [editorWeightValue, setEditorWeightValue] = useDerivedState(props.weight?.value);
  const [editorWeightUnit, setEditorWeightUnit] = useDerivedState(props.weight?.unit ?? preferredWeightUnit);

  const nonZeroIncrement = props.increment.isZero() ? new BigNumber('2.5') : props.increment;

  const incrementWeight = () => {
    if (editorWeightValue === undefined) {
      return;
    }
    setEditorWeightValue(editorWeightValue.plus(nonZeroIncrement));
    setText(localeFormatBigNumber(editorWeightValue.plus(nonZeroIncrement)));
    emitCurrentValues(editorWeightValue.plus(nonZeroIncrement), editorWeightUnit);
  };
  const decrementWeight = () => {
    if (editorWeightValue === undefined) {
      return;
    }
    if (!props.allowNegative && editorWeightValue.isLessThan(nonZeroIncrement)) {
      return;
    }
    setEditorWeightValue(editorWeightValue.minus(nonZeroIncrement));
    setText(localeFormatBigNumber(editorWeightValue.minus(nonZeroIncrement)));
    emitCurrentValues(editorWeightValue.minus(nonZeroIncrement), editorWeightUnit);
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

  const emitCurrentValues = (editorWeightValue: BigNumber | undefined, editorWeightUnit: WeightUnit) => {
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
    <WeightInputControls
      autoFocus
      text={text}
      onChangeText={handleTextChange}
      unit={editorWeightUnit}
      onUnitChange={(unit) => {
        setEditorWeightUnit(unit);
        emitCurrentValues(editorWeightValue, unit);
      }}
      onIncrement={incrementWeight}
      onDecrement={decrementWeight}
    />
  );
}
