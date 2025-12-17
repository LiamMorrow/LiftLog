import Button from '@/components/presentation/gesture-wrappers/button';
import { T } from '@tolgee/react';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

import { Portal, Dialog, TextInput } from 'react-native-paper';

export default function RecordedExerciseNotesEditor(props: {
  exerciseName: string;
  open: boolean;
  notes: string | undefined;
  onUpdateNotes: (n: string) => void;
  onDismiss: () => void;
}) {
  const { open, notes, onUpdateNotes, onDismiss, exerciseName } = props;
  const [editorNotes, setEditorNotes] = useState(notes ?? '');

  useEffect(() => {
    setEditorNotes(notes || '');
  }, [notes]);
  return (
    <Portal>
      <KeyboardAvoidingView
        behavior={'height'}
        style={{
          flex: 1,
          pointerEvents: open ? 'box-none' : 'none',
        }}
      >
        <Dialog visible={open} onDismiss={onDismiss}>
          <Dialog.Title>
            <T
              keyName="workout.notes_for.title"
              params={{ name: exerciseName }}
            />
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              defaultValue={editorNotes}
              multiline
              mode="outlined"
              numberOfLines={6}
              onChangeText={setEditorNotes}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              testID="cancel-notes"
              onPress={() => {
                onDismiss();
                setEditorNotes(notes || '');
              }}
            >
              <T keyName="generic.cancel.button" />
            </Button>
            <Button
              testID="save-notes"
              onPress={() => {
                onUpdateNotes(editorNotes);
                onDismiss();
              }}
            >
              <T keyName="generic.save.button" />
            </Button>
          </Dialog.Actions>
        </Dialog>
      </KeyboardAvoidingView>
    </Portal>
  );
}
