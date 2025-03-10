import WeightFormat from '@/components/presentation/weight-format';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import {
  Button,
  Dialog,
  Portal,
  TextInput,
  useTheme,
} from 'react-native-paper';

type WeightDialogProps = {
  open: boolean;
  onClose: () => void;
  increment: BigNumber;
  label?: string;
} & (
  | {
      weight: BigNumber;
      updateWeight: (weight: BigNumber) => void;
      allowNull?: false;
    }
  | {
      weight: BigNumber | undefined;
      updateWeight: (weight: BigNumber | undefined) => void;
      allowNull: true;
    }
);

export default function WeightDialog(props: WeightDialogProps) {
  const theme = useTheme();
  const [text, setText] = useState(props.weight?.toFormat() ?? '');
  const [editorWeight, setEditorWeight] = useState<BigNumber | undefined>(
    props.weight,
  );

  useEffect(() => {
    setText(props.weight?.toFormat() ?? '');
    setEditorWeight(props.weight);
  }, [props.open, props.weight, setText]);

  const nonZeroIncrement = props.increment.isZero()
    ? new BigNumber('2.5')
    : props.increment;
  // TODO get from settings context
  const weightSuffix = 'kg';

  const incrementWeight = () => {
    if (editorWeight === undefined) {
      return;
    }
    setEditorWeight(editorWeight.plus(nonZeroIncrement));
    setText(editorWeight.plus(nonZeroIncrement).toFormat());
  };
  const decrementWeight = () => {
    if (editorWeight === undefined) {
      return;
    }
    setEditorWeight(editorWeight.minus(nonZeroIncrement));
    setText(editorWeight.minus(nonZeroIncrement).toFormat());
  };

  const handleTextChange = (text: string) => {
    setText(text);
    if (text.trim() === '') {
      setEditorWeight(undefined);
      return;
    }

    if (!BigNumber(text).isNaN()) {
      setEditorWeight(new BigNumber(text));
      return;
    }
  };

  const onSaveClick = () => {
    if (editorWeight === undefined && !props.allowNull) {
      props.onClose();
      return;
    }
    props.updateWeight(editorWeight!);
    props.onClose();
  };

  return (
    <Portal>
      <Dialog visible={props.open} onDismiss={props.onClose}>
        <Dialog.Title>{props.label ?? 'WEIGHT_TODO_TOLGEE'}</Dialog.Title>
        <Dialog.Content>
          <View className="flex gap-2">
            <TextInput
              data-cy="weight-input"
              label={props.label ?? 'WEIGHT_TODO_TOLGEE'}
              right={<TextInput.Affix text={weightSuffix} />}
              selectTextOnFocus
              mode="outlined"
              inputMode="decimal"
              keyboardType="decimal-pad"
              value={text}
              onChangeText={handleTextChange}
              style={{ backgroundColor: theme.colors.elevation.level3 }}
            />
            <View className="flex-row justify-between">
              <Button
                icon={'minus'}
                mode="outlined"
                data-cy="decrement-weight"
                onPress={decrementWeight}
              >
                <WeightFormat weight={nonZeroIncrement} />
              </Button>
              <Button
                icon={'plus'}
                mode="outlined"
                data-cy="increment-weight"
                onPress={incrementWeight}
              >
                <WeightFormat weight={nonZeroIncrement} />
              </Button>
            </View>
          </View>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={props.onClose}>TODO_Close</Button>
          <Button onPress={onSaveClick}>TODO_Save</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
