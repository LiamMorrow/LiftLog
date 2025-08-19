import { spacing } from '@/hooks/useAppTheme';
import { PotentialSet } from '@/models/session-models';
import { T } from '@tolgee/react';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import {
  Button,
  Dialog,
  IconButton,
  Portal,
  TextInput,
} from 'react-native-paper';

interface PotentialSetAdditionalActionsDialogProps {
  open: boolean;
  set: PotentialSet | undefined;
  updateRepCount: (reps: number | undefined) => void;
  close: () => void;
}

export default function PotentialSetAdditionalActionsDialog({
  close,
  open,
  set,
  updateRepCount,
}: PotentialSetAdditionalActionsDialogProps) {
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
        style={{ flex: 1, pointerEvents: 'box-none' }}
      >
        <Dialog visible={open} onDismiss={close}>
          <Dialog.Title>
            <T keyName="SelectReps" />
          </Dialog.Title>
          <Dialog.Content
            style={{
              flexDirection: 'row',
              gap: spacing[2],
              alignItems: 'center',
            }}
          >
            <TextInput
              style={{ flex: 1 }}
              label={<T keyName="Reps" />}
              inputMode="numeric"
              value={repCountText}
              selectTextOnFocus
              error={!isValid}
              onChangeText={setRepCountText}
              autoFocus
            />
            <IconButton
              mode="outlined"
              icon={'close'}
              onPress={() => {
                setRepCountText('');
                updateRepCount(undefined);
                close();
              }}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={close}>{<T keyName="Cancel" />}</Button>
            <Button disabled={!isValid} onPress={save}>
              {<T keyName="Save" />}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </KeyboardAvoidingView>
    </Portal>
  );
}
