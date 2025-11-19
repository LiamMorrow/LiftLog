import { spacing } from '@/hooks/useAppTheme';
import {
  localeFormatBigNumber,
  localeParseBigNumber,
} from '@/utils/locale-bignumber';
import { T, useTranslate } from '@tolgee/react';
import BigNumber from 'bignumber.js';
import { ReactNode, useEffect, useState } from 'react';
import { View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import IconButton from '@/components/presentation/gesture-wrappers/icon-button';
import Button from '@/components/presentation/gesture-wrappers/button';
import {
  Dialog,
  Portal,
  TextInput,
  Tooltip,
  useTheme,
} from 'react-native-paper';
import { shortFormatWeightUnit, Weight } from '@/models/weight';

type WeightDialogProps = {
  open: boolean;
  onClose: () => void;
  increment: BigNumber;
  label?: string;
  children?: ReactNode;
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

export default function WeightDialog(props: WeightDialogProps) {
  const theme = useTheme();
  const { t } = useTranslate();
  const [text, setText] = useState(localeFormatBigNumber(props.weight?.value));
  const [editorWeight, setEditorWeight] = useState<Weight | undefined>(
    props.weight,
  );

  useEffect(() => {
    setText(localeFormatBigNumber(props.weight?.value));
    setEditorWeight(props.weight);
  }, [props.open, props.weight]);

  const nonZeroIncrement = props.increment.isZero()
    ? new BigNumber('2.5')
    : props.increment;

  const incrementWeight = () => {
    if (editorWeight === undefined) {
      return;
    }
    setEditorWeight(editorWeight.plus(nonZeroIncrement));
    setText(localeFormatBigNumber(editorWeight.plus(nonZeroIncrement).value));
  };
  const decrementWeight = () => {
    if (editorWeight === undefined) {
      return;
    }
    if (
      !props.allowNegative &&
      editorWeight.value.isLessThan(nonZeroIncrement)
    ) {
      return;
    }
    setEditorWeight(editorWeight.minus(nonZeroIncrement));
    setText(localeFormatBigNumber(editorWeight.minus(nonZeroIncrement).value));
  };

  const handleTextChange = (text: string) => {
    setText(text);
    if (text.trim() === '') {
      setEditorWeight(undefined);
      return;
    }

    if (!localeParseBigNumber(text).isNaN()) {
      setEditorWeight(
        editorWeight?.with({ value: localeParseBigNumber(text) }),
      );
      return;
    }
  };

  const onSaveClick = () => {
    if (editorWeight === undefined && !props.allowNull) {
      props.onClose();
      return;
    }
    if (!props.allowNegative && editorWeight?.value.isLessThan(0)) {
      return;
    }
    props.updateWeight(editorWeight!);
    props.onClose();
  };

  return (
    <Portal>
      <KeyboardAvoidingView
        behavior={'height'}
        style={{ flex: 1, pointerEvents: props.open ? 'box-none' : 'none' }}
      >
        <Dialog visible={props.open} onDismiss={props.onClose}>
          <Dialog.Title>{props.label ?? <T keyName="Weight" />}</Dialog.Title>
          <Dialog.Content>
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
                  right={
                    <TextInput.Affix
                      text={shortFormatWeightUnit(props.weight?.unit)}
                    />
                  }
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
                {props.allowNegative && (
                  <Tooltip title={t('Toggle negative')}>
                    <IconButton
                      mode="outlined"
                      icon={'plusMinus'}
                      onPress={() => {
                        setEditorWeight(editorWeight?.multipliedBy(-1));
                        setText(
                          localeFormatBigNumber(
                            editorWeight?.multipliedBy(-1).value,
                          ),
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
