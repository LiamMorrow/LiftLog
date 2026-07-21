import { spacing } from '@/hooks/useAppTheme';
import { T } from '@tolgee/react';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Button from '@/components/presentation/foundation/gesture-wrappers/button';
import { Dialog, Portal, TextInput, useTheme } from 'react-native-paper';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

interface PowerDialogProps {
  open: boolean;
  power: number | undefined;
  placeholder: number | undefined;
  onClose: () => void;
  updatePower: (power: number | undefined) => void;
}

export default function PowerDialog(props: PowerDialogProps) {
  const theme = useTheme();
  const [text, setText] = useState(props.power?.toString() ?? '');

  useEffect(() => {
    setText(props.power?.toString() ?? '');
  }, [props.open, props.power]);

  const parsed = Number(text);
  const isValid = !text || (Number.isInteger(parsed) && parsed >= 0);

  const onSaveClick = () => {
    if (!isValid) {
      return;
    }
    props.updatePower(text ? parsed : undefined);
    props.onClose();
  };

  return (
    props.open && (
      <Portal>
        <KeyboardAvoidingView behavior={'height'} style={{ flex: 1, pointerEvents: props.open ? 'box-none' : 'none' }}>
          <Dialog visible={props.open} onDismiss={props.onClose}>
            <Dialog.Title>
              <T keyName="exercise.select_power.title" />
            </Dialog.Title>
            <Dialog.Content>
              <View style={{ gap: spacing[2] }}>
                <TextInput
                  testID="power-input"
                  selectTextOnFocus
                  mode="outlined"
                  inputMode="numeric"
                  keyboardType="number-pad"
                  submitBehavior="blurAndSubmit"
                  returnKeyType="done"
                  autoFocus
                  value={text}
                  error={!isValid}
                  placeholder={props.placeholder?.toString()}
                  onChangeText={setText}
                  right={<TextInput.Affix text="W" />}
                  style={{ backgroundColor: theme.colors.elevation.level3 }}
                />
              </View>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={props.onClose} testID="power-skip">
                <T keyName="generic.skip.button" />
              </Button>
              <Button onPress={onSaveClick} testID="power-save" disabled={!isValid}>
                <T keyName="generic.save.button" />
              </Button>
            </Dialog.Actions>
          </Dialog>
        </KeyboardAvoidingView>
      </Portal>
    )
  );
}
