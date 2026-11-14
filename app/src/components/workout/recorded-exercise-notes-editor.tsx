import { TextField } from '@/components/foundation/text-field';
import { DockedEditor } from '@/components/foundation/edit-dock';
import { spacing } from '@/hooks/useAppTheme';
import { useDerivedState } from '@/hooks/useDerivedState';
import { useTranslate } from '@tolgee/react';

export default function RecordedExerciseNotesEditor(props: {
  exerciseName: string;
  open: boolean;
  notes: string | undefined;
  onUpdateNotes: (n: string) => void;
  onDismiss: () => void;
}) {
  const { t } = useTranslate();
  const [editorNotes, setEditorNotes] = useDerivedState(props.notes, (notes) => notes ?? '');

  return (
    <DockedEditor
      open={props.open}
      onClose={() => {
        if (editorNotes !== (props.notes ?? '')) {
          props.onUpdateNotes(editorNotes);
        }
        props.onDismiss();
      }}
      title={t('workout.notes.title')}
      subtitle={props.exerciseName}
    >
      <TextField
        underline="always"
        testID="exercise-notes-input"
        accessibilityLabel={t('workout.notes.title')}
        // Uncontrolled on purpose: the dock renders this field in another tree (via the dock store), so a
        // controlled `value` lands one render after the keystroke. TextInput then sees a stale value, pushes
        // it back to native and the cursor jumps to the start on every character.
        defaultValue={editorNotes}
        onChangeText={setEditorNotes}
        multiline
        autoFocus
        textAlignVertical="bottom"
        style={{ paddingBottom: spacing[2] }}
      />
    </DockedEditor>
  );
}
