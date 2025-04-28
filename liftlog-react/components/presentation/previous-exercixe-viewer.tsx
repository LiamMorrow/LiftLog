import EmptyInfo from '@/components/presentation/empty-info';
import ExerciseSummary from '@/components/presentation/exercise-summary';
import { SurfaceText } from '@/components/presentation/surface-text';
import { spacing } from '@/hooks/useAppTheme';
import { RecordedExercise } from '@/models/session-models';
import { T } from '@tolgee/react';
import { ScrollView, View } from 'react-native';
import { Button, Portal, Dialog } from 'react-native-paper';

function PreviousExerciseContent(props: {
  previousRecordedExercises: RecordedExercise[];
}) {
  return (
    <View style={{ gap: spacing[2] }}>
      {props.previousRecordedExercises.map((ex, i) => (
        <ScrollView horizontal key={i} style={{ gap: spacing[2] }}>
          <SurfaceText>
            {ex.lastRecordedSet?.set?.completionDateTime
              .toLocalDate()
              .toString()}
          </SurfaceText>
          <ExerciseSummary exercise={ex} isFilled showName={false} />
        </ScrollView>
      ))}
      {props.previousRecordedExercises.length ? undefined : (
        <View style={{ height: 100 }}>
          <EmptyInfo>
            <T keyName="NeverDoneThisExerciseBefore" />
          </EmptyInfo>
        </View>
      )}
    </View>
  );
}

export default function PreviousExerciseViewer(props: {
  name: string;
  previousRecordedExercises: RecordedExercise[];
  open: boolean;
  close: () => void;
}) {
  return (
    <Portal>
      <Dialog visible={props.open} onDismiss={props.close}>
        <Dialog.Title>
          <T keyName="PreviousSessionsFor{0}" params={{ 0: props.name }} />
        </Dialog.Title>
        <Dialog.Content>
          <PreviousExerciseContent
            previousRecordedExercises={props.previousRecordedExercises}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={props.close}>
            <T keyName="Close" />
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
