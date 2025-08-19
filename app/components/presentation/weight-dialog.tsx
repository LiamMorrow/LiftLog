import WeightFormat from '@/components/presentation/weight-format';
import { spacing } from '@/hooks/useAppTheme';
import { useWeightSuffix } from '@/hooks/useWeightSuffix';
import { T } from '@tolgee/react';
import BigNumber from 'bignumber.js';
import { ReactNode, useEffect, useState } from 'react';
import { View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
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
  children?: ReactNode;
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
  const weightSuffix = useWeightSuffix();

  useEffect(() => {
    setText(props.weight?.toFormat() ?? '');
    setEditorWeight(props.weight);
  }, [props.open, props.weight, setText]);

  const nonZeroIncrement = props.increment.isZero()
    ? new BigNumber('2.5')
    : props.increment;

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
      <KeyboardAvoidingView
        behavior={'height'}
        style={{ flex: 1, pointerEvents: 'box-none' }}
      >
        <Dialog visible={props.open} onDismiss={props.onClose}>
          <Dialog.Title>{props.label ?? <T keyName="Weight" />}</Dialog.Title>
          <Dialog.Content>
            <View style={{ gap: spacing[2] }}>
              <TextInput
                testID="weight-input"
                label={props.label ?? <T keyName="Weight" />}
                right={<TextInput.Affix text={weightSuffix} />}
                selectTextOnFocus
                mode="outlined"
                inputMode="decimal"
                keyboardType="decimal-pad"
                value={text}
                onChangeText={handleTextChange}
                style={{ backgroundColor: theme.colors.elevation.level3 }}
              />
              <View
                style={{
                  flexDirection: 'row',
                  gap: spacing[2],
                  justifyContent: 'center',
                }}
              >
                <Button
                  icon={'minus'}
                  mode="outlined"
                  testID="decrement-weight"
                  onPress={decrementWeight}
                >
                  <WeightFormat weight={nonZeroIncrement} />
                </Button>
                <Button
                  icon={'plus'}
                  mode="outlined"
                  testID="increment-weight"
                  onPress={incrementWeight}
                >
                  <WeightFormat weight={nonZeroIncrement} />
                </Button>
              </View>
              {props.children}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={props.onClose} testID="close">
              <T keyName="Close" />
            </Button>
            <Button onPress={onSaveClick} testID="save">
              <T keyName="Save" />
            </Button>
          </Dialog.Actions>
        </Dialog>
      </KeyboardAvoidingView>
    </Portal>
  );
}
