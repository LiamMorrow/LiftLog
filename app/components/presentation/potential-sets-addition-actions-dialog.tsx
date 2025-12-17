import { useAppTheme } from '@/hooks/useAppTheme';
import { PotentialSet } from '@/models/session-models';
import { T } from '@tolgee/react';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import IconButton from '@/components/presentation/gesture-wrappers/icon-button';
import { Dialog, Portal, Text, TextInput } from 'react-native-paper';
import Button from '@/components/presentation/gesture-wrappers/button';

interface PotentialSetAdditionalActionsDialogProps {
  open: boolean;
  set: PotentialSet;
  repTarget: number;
  updateRepCount: (reps: number | undefined) => void;
  close: () => void;
}

export default function PotentialSetAdditionalActionsDialog({
  close,
  open,
  set,
  updateRepCount,
  repTarget,
}: PotentialSetAdditionalActionsDialogProps) {
  const { colors } = useAppTheme();
  const originalReps = set?.set?.repsCompleted;

  const [repCountText, setRepCountText] = useState<string>(
    originalReps?.toString() ?? '',
  );
  const parsedRepCount = Number(repCountText);
  const isValid =
    !repCountText || (Number.isInteger(parsedRepCount) && parsedRepCount >= 0);
  useEffect(() => {
    setRepCountText(originalReps?.toString() ?? '');
  }, [originalReps]);

  const save = () => {
    if (!isValid) {
      return;
    }

    updateRepCount(repCountText ? parsedRepCount : undefined);
    close();
  };
  return (
    <Portal>
      <KeyboardAvoidingView
        behavior={'height'}
        style={{ flex: 1, pointerEvents: open ? 'box-none' : 'none' }}
      >
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
                  icon={() => <Text>{i}</Text>}
                  onPress={() => {
                    setRepCountText(i.toString());
                    updateRepCount(i);
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
                  updateRepCount(undefined);
                  close();
                }}
              />
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={close}>
              {<T keyName="generic.cancel.button" />}
            </Button>
            <Button disabled={!isValid} onPress={save}>
              {<T keyName="generic.save.button" />}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </KeyboardAvoidingView>
    </Portal>
  );
}
