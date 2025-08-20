import { AccordionItem } from '@/components/presentation/accordion-item';
import { spacing } from '@/hooks/useAppTheme';
import { RecordedExercise } from '@/models/session-models';
import { useState } from 'react';
import { View } from 'react-native';
import { Card, Divider, IconButton, Text } from 'react-native-paper';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';

interface ExerciseNotesDisplayProps {
  exercise: RecordedExercise;
  previousExercise: RecordedExercise | undefined;
}
export default function ExerciseNotesDisplay(props: ExerciseNotesDisplayProps) {
  const notes = props.exercise.notes ?? '';
  const blueprintNotes = props.exercise.blueprint.notes ?? '';
  const previousNotes = props.previousExercise?.notes
    ? 'Last time: ' + props.previousExercise.notes
    : '';
  const [expanded, setExpanded] = useState(false);
  const unexpandedNotes = notes || previousNotes || blueprintNotes;

  const hasNotes = !(!notes && !blueprintNotes && !previousNotes);
  if (!hasNotes) {
    return undefined;
  }
  return (
    <Card mode="contained" style={[{ marginTop: spacing[4] }]}>
      {hasNotes && (
        <AccordionItem isExpanded={expanded}>
          <Card.Content>
            <View
              style={{
                flexDirection: 'row',
                gap: spacing[2],
                marginTop: spacing[4],
              }}
            >
              <View
                style={{ gap: spacing[2], flex: 1, paddingRight: spacing[2] }}
              >
                {blueprintNotes && (
                  <Notes
                    value={blueprintNotes}
                    testID="exercise-blueprint-notes"
                  />
                )}
                {previousNotes && blueprintNotes && <Divider />}
                {previousNotes && (
                  <Notes
                    value={previousNotes}
                    testID="exercise-previous-notes"
                  />
                )}
                {notes && (previousNotes || blueprintNotes) && <Divider />}
                {notes && <Notes value={notes} testID="exercise-notes" />}
              </View>
            </View>
          </Card.Content>
        </AccordionItem>
      )}
      <Card.Actions>
        {!expanded && (
          <Animated.View
            entering={FadeInDown}
            exiting={FadeOutUp}
            style={{
              flex: 1,
              alignItems: 'center',
              flexDirection: 'row',
              overflow: 'hidden',
            }}
          >
            <Text style={{ flex: 1 }} numberOfLines={1} ellipsizeMode="tail">
              {unexpandedNotes}
            </Text>
          </Animated.View>
        )}

        <IconButton
          icon={expanded ? 'unfoldLess' : 'unfoldMore'}
          animated
          onPress={() => setExpanded((e) => !e)}
        />
      </Card.Actions>
    </Card>
  );
}

function Notes(props: { value: string; testID: string }) {
  return <Text testID={props.testID}>{props.value}</Text>;
}
