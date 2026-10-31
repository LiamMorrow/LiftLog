import { TextField } from '@/components/presentation/foundation/text-field';
import { DockedEditor } from '@/components/presentation/workout/edit-dock';
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
        value={editorNotes}
        onChangeText={setEditorNotes}
        multiline
        autoFocus
        textAlignVertical="top"
        style={{ minHeight: spacing[20], maxHeight: spacing[40], paddingBottom: spacing[2] }}
      />
    </DockedEditor>
  );
}
