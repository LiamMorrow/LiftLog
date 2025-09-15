import { spacing } from '@/hooks/useAppTheme';
import { useWeightSuffix } from '@/hooks/useWeightSuffix';
import {
  localeFormatBigNumber,
  localeParseBigNumber,
} from '@/utils/locale-bignumber';
import { T, useTranslate } from '@tolgee/react';
import BigNumber from 'bignumber.js';
import { ReactNode, useEffect, useState } from 'react';
import { View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import {
  Button,
  Dialog,
  IconButton,
  Portal,
  TextInput,
  Tooltip,
  useTheme,
} from 'react-native-paper';

type WeightDialogProps = {
  open: boolean;
  onClose: () => void;
  increment: BigNumber;
  label?: string;
  children?: ReactNode;
  allowNegative?: boolean | undefined;
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
  const { t } = useTranslate();
  const [text, setText] = useState(localeFormatBigNumber(props.weight));
  const [editorWeight, setEditorWeight] = useState<BigNumber | undefined>(
    props.weight,
  );
  const weightSuffix = useWeightSuffix();

  useEffect(() => {
    setText(localeFormatBigNumber(props.weight));
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
    setText(localeFormatBigNumber(editorWeight.plus(nonZeroIncrement)));
  };
  const decrementWeight = () => {
    if (editorWeight === undefined) {
      return;
    }
    if (!props.allowNegative && editorWeight.isLessThan(nonZeroIncrement)) {
      return;
    }
    setEditorWeight(editorWeight.minus(nonZeroIncrement));
    setText(localeFormatBigNumber(editorWeight.minus(nonZeroIncrement)));
  };

  const handleTextChange = (text: string) => {
    setText(text);
    if (text.trim() === '') {
      setEditorWeight(undefined);
      return;
    }

    if (!localeParseBigNumber(text).isNaN()) {
      setEditorWeight(localeParseBigNumber(text));
      return;
    }
  };

  const onSaveClick = () => {
    if (editorWeight === undefined && !props.allowNull) {
      props.onClose();
      return;
    }
    if (!props.allowNegative && editorWeight?.isLessThan(0)) {
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
                  right={<TextInput.Affix text={weightSuffix} />}
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
                        setEditorWeight(
                          editorWeight?.multipliedBy(-1) as BigNumber,
                        );
                        setText(
                          localeFormatBigNumber(editorWeight?.multipliedBy(-1)),
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
