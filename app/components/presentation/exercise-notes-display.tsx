import { SurfaceText } from '@/components/presentation/surface-text';
import { spacing } from '@/hooks/useAppTheme';
import { RecordedExercise } from '@/models/session-models';
import { View } from 'react-native';
import { Card, Divider, Icon } from 'react-native-paper';

interface ExerciseNotesDisplayProps {
  exercise: RecordedExercise;
  previousExercise: RecordedExercise | undefined;
}
export default function ExerciseNotesDisplay(props: ExerciseNotesDisplayProps) {
  const notes = props.exercise.notes ?? '';
  const blueprintNotes = props.exercise.blueprint.notes ?? '';
  const previousNotes = props.previousExercise?.notes ?? '';

  if (!notes && !blueprintNotes && !previousNotes) {
    return undefined;
  }
  return (
    <Card mode="contained" style={{ marginTop: spacing[4] }}>
      <Card.Content>
        <View style={{ flexDirection: 'row', gap: spacing[2] }}>
          <Icon source={'notes'} size={24} />
          <View style={{ gap: spacing[2], flex: 1 }}>
            {blueprintNotes && (
              <Notes value={blueprintNotes} testID="exercise-blueprint-notes" />
            )}
            {previousNotes && blueprintNotes && <Divider />}
            {previousNotes && (
              <Notes
                value={'Last time: ' + previousNotes}
                testID="exercise-previous-notes"
              />
            )}
            {notes && (previousNotes || blueprintNotes) && <Divider />}
            {notes && <Notes value={notes} testID="exercise-notes" />}
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}

function Notes(props: { value: string; testID: string }) {
  return <SurfaceText testID={props.testID}>{props.value}</SurfaceText>;
}
