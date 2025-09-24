import { AccordionItem } from '@/components/presentation/accordion-item';
import { spacing } from '@/hooks/useAppTheme';
import { RecordedExercise } from '@/models/session-models';
import { useAppSelector } from '@/store';
import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { Card, Divider, Text } from 'react-native-paper';
import IconButton from '@/components/presentation/gesture-wrappers/icon-button';

interface ExerciseNotesDisplayProps {
  exercise: RecordedExercise;
  previousExercise: RecordedExercise | undefined;
}
export default function ExerciseNotesDisplay(props: ExerciseNotesDisplayProps) {
  const expandByDefault = useAppSelector(
    (x) => x.settings.notesExpandedByDefault,
  );
  const notes = props.exercise.notes ?? '';
  const blueprintNotes = props.exercise.blueprint.notes ?? '';
  const previousNotes = props.previousExercise?.notes
    ? 'Last time: ' + props.previousExercise.notes
    : '';
  const [expanded, setExpanded] = useState(expandByDefault);
  const [maxNumberOfLines, setMaxNumberOfLines] = useState(
    expandByDefault ? undefined : 1,
  );
  const iconButtonHeight = 40;
  const hasNotes = !(!notes && !blueprintNotes && !previousNotes);
  const handleAccordionToggle = (accordionExpanded: boolean) => {
    if (!accordionExpanded) {
      setMaxNumberOfLines(1);
    }
  };
  const handleToggleExpanded = useCallback(() => {
    const nowExpanded = !expanded;
    if (nowExpanded) {
      setMaxNumberOfLines(undefined);
    }
    setExpanded(nowExpanded);
  }, [expanded]);

  const renderText = (maxNumberOfLines: number | undefined) => {
    const renderNotes = notes;
    const renderBlueprintNotes =
      (maxNumberOfLines === undefined && blueprintNotes) ||
      (!renderNotes && blueprintNotes);
    const renderPreviousNotes =
      (maxNumberOfLines === undefined && previousNotes) ||
      (!renderBlueprintNotes && !renderNotes && previousNotes);
    return (
      <>
        {renderNotes && (
          <Text testID="exercise-notes" numberOfLines={maxNumberOfLines}>
            {notes}
          </Text>
        )}
        {renderNotes && (renderPreviousNotes || renderBlueprintNotes) && (
          <Divider />
        )}
        {renderBlueprintNotes && (
          <Text
            testID="exercise-blueprint-notes"
            numberOfLines={maxNumberOfLines}
          >
            {blueprintNotes}
          </Text>
        )}
        {renderPreviousNotes && renderBlueprintNotes && <Divider />}
        {renderPreviousNotes && (
          <Text
            testID="exercise-previous-notes"
            numberOfLines={maxNumberOfLines}
          >
            {previousNotes}
          </Text>
        )}
      </>
    );
  };
  if (!hasNotes) {
    return undefined;
  }
  return (
    <Card mode="contained" style={[{ marginTop: spacing[4] }]}>
      <Card.Content style={{ flexDirection: 'row' }}>
        <IconButton
          icon={expanded ? 'unfoldLess' : 'unfoldMore'}
          style={{
            margin: 0,
            marginLeft: -spacing[3],
            alignSelf: 'flex-start',
          }}
          animated
          onPress={handleToggleExpanded}
        />

        <View style={{ flex: 1 }}>
          <AccordionItem
            isExpanded={expanded}
            startsExpanded={expandByDefault}
            onToggled={handleAccordionToggle}
            unexpandedHeight={iconButtonHeight}
          >
            <View
              style={{
                flexDirection: 'row',
                gap: spacing[2],
                marginTop: spacing[3],
              }}
            >
              <View style={{ flex: 1, paddingRight: spacing[2] }}>
                <View style={{ position: 'absolute', gap: spacing[2] }}>
                  {renderText(maxNumberOfLines)}
                </View>
                {/* Render this so it doesn't jump around when expanding - need to always reserve the full text space */}
                <View
                  style={{ visibility: 'hidden', opacity: 0, gap: spacing[2] }}
                >
                  {renderText(undefined)}
                </View>
              </View>
            </View>
          </AccordionItem>
        </View>
      </Card.Content>
    </Card>
  );
}
