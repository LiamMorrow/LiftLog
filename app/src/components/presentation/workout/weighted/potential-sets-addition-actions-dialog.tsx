import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { PotentialSet } from '@/models/session-models';
import { T } from '@tolgee/react';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import IconButton from '@/components/presentation/foundation/gesture-wrappers/icon-button';
import { Dialog, Portal, Text, TextInput } from 'react-native-paper';
import Button from '@/components/presentation/foundation/gesture-wrappers/button';

interface PotentialSetAdditionalActionsDialogProps {
  open: boolean;
  set: PotentialSet;
  repTarget: number;
  showPower: boolean;
  updateRepCount: (reps: number | undefined, power: number | undefined) => void;
  close: () => void;
}

export default function PotentialSetAdditionalActionsDialog({
  close,
  open,
  set,
  updateRepCount,
  repTarget,
  showPower,
}: PotentialSetAdditionalActionsDialogProps) {
  const { colors } = useAppTheme();
  const originalReps = set?.set?.repsCompleted;
  const originalPower = set?.set?.power;

  const [repCountText, setRepCountText] = useState<string>(originalReps?.toString() ?? '');
  const [powerText, setPowerText] = useState<string>(originalPower?.toString() ?? '');
  const parsedRepCount = Number(repCountText);
  const isValid = !repCountText || (Number.isInteger(parsedRepCount) && parsedRepCount >= 0);
  const parsedPower = Number(powerText);
  const isPowerValid = !powerText || (Number.isInteger(parsedPower) && parsedPower >= 0);
  useEffect(() => {
    if (open) {
      setRepCountText(originalReps?.toString() ?? '');
      setPowerText(originalPower?.toString() ?? '');
    }
  }, [open, originalReps, originalPower]);

  const powerValue = () => (powerText && isPowerValid ? parsedPower : undefined);

  const save = () => {
    if (!isValid || !isPowerValid) {
      return;
    }

    updateRepCount(repCountText ? parsedRepCount : undefined, powerValue());
    close();
  };
  return (
    open && (
      <Portal>
        <KeyboardAvoidingView behavior={'height'} style={{ flex: 1, pointerEvents: open ? 'box-none' : 'none' }}>
          <Dialog visible={open} onDismiss={close}>
            <Dialog.Title>
              <T keyName="exercise.select_reps.title" />
            </Dialog.Title>
            <Dialog.Content>
              <TextInput
                label={<T keyName="exercise.reps.label" />}
                inputMode="numeric"
                value={repCountText}
                selectTextOnFocus
                error={!isValid}
                onChangeText={setRepCountText}
                autoFocus
              />

              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {Array.from({ length: repTarget + 3 }).map((_, i) => (
                  <IconButton
                    key={i}
                    mode="outlined"
                    disabled={!isPowerValid}
                    icon={() => <Text>{i}</Text>}
                    onPress={() => {
                      setRepCountText(i.toString());
                      updateRepCount(i, powerValue());
                      close();
                    }}
                  />
                ))}
                <IconButton
                  mode="contained"
                  iconColor={colors.error}
                  containerColor={colors.errorContainer}
                  icon={'close'}
                  onPress={() => {
                    setRepCountText('');
                    setPowerText('');
                    updateRepCount(undefined, undefined);
                    close();
                  }}
                />
              </View>
              {showPower && (
                <TextInput
                  label={<T keyName="exercise.power.label" />}
                  inputMode="numeric"
                  value={powerText}
                  selectTextOnFocus
                  error={!isPowerValid}
                  onChangeText={setPowerText}
                  right={<TextInput.Affix text="W" />}
                  style={{ marginTop: spacing[2] }}
                />
              )}
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={close}>{<T keyName="generic.cancel.button" />}</Button>
              <Button disabled={!isValid || !isPowerValid} onPress={save}>
                {<T keyName="generic.save.button" />}
              </Button>
            </Dialog.Actions>
          </Dialog>
        </KeyboardAvoidingView>
      </Portal>
    )
  );
}
