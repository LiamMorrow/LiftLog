import { spacing } from '@/hooks/useAppTheme';
import { ExerciseBlueprint, SessionBlueprint } from '@/models/blueprint-models';
import { useAppSelectorWithArg } from '@/store';
import { showSnackbar } from '@/store/app';
import { selectProgram, setProgramSession } from '@/store/program';
import { T, useTranslate } from '@tolgee/react';
import { useState } from 'react';
import { View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { Dialog, List, Portal, RadioButton, Text } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import Button from '@/components/presentation/gesture-wrappers/button';

type CopyExerciseDialogProps = {
  visible: boolean;
  onDismiss: () => void;
  exerciseBlueprint: ExerciseBlueprint;
  currentSessionIndex: number;
  programId: string;
};

export default function CopyExerciseDialog({
  visible,
  onDismiss,
  exerciseBlueprint,
  currentSessionIndex,
  programId,
}: CopyExerciseDialogProps) {
  const dispatch = useDispatch();
  const { t } = useTranslate();
  const program = useAppSelectorWithArg(selectProgram, programId);
  const [selectedSessionIndex, setSelectedSessionIndex] = useState<number>();

  // Filter out the current session and map sessions to have indices
  const otherSessions = program.sessions
    .map((session, index) => ({ session, index }))
    .filter(({ index }) => index !== currentSessionIndex);

  const handleCopy = () => {
    if (selectedSessionIndex !== undefined) {
      const targetSession = program.sessions[selectedSessionIndex];

      // Create a new session blueprint with the added exercise
      const newExercises = [...targetSession.exercises, exerciseBlueprint];
      const updatedSession = targetSession.with({
        exercises: newExercises,
      });

      // Update the program session
      dispatch(
        setProgramSession({
          programId,
          sessionIndex: selectedSessionIndex,
          sessionBlueprint: updatedSession,
        }),
      );

      dispatch(
        showSnackbar({
          text: t('exercise.copied_to_session.message', {
            exerciseName: exerciseBlueprint.name,
            targetSessionName: targetSession.name,
          }),
        }),
      );

      onDismiss();
      setSelectedSessionIndex(undefined); // Reset selection
    }
  };

  const renderSessionItem = ({
    item,
  }: {
    item: { session: SessionBlueprint; index: number };
  }) => (
    <List.Item
      title={item.session.name}
      description={`${item.session.exercises.length} exercises`}
      left={() => (
        <RadioButton
          value={item.index.toString()}
          status={selectedSessionIndex === item.index ? 'checked' : 'unchecked'}
          onPress={() => setSelectedSessionIndex(item.index)}
        />
      )}
      onPress={() => setSelectedSessionIndex(item.index)}
    />
  );

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>
          <T keyName="exercise.copy_to_session.button" />
        </Dialog.Title>
        <Dialog.Content>
          <View style={{ gap: spacing[2] }}>
            <Text variant="bodyMedium">
              <T
                keyName="exercise.copy_to_session.select_session.label"
                params={{ exerciseName: exerciseBlueprint.name }}
              />
            </Text>
            {otherSessions.length === 0 ? (
              <Text variant="bodyMedium" style={{ fontStyle: 'italic' }}>
                <T keyName="plan.no_other_sessions_available.message" />
              </Text>
            ) : (
              <View style={{ maxHeight: 200 }}>
                <FlatList
                  data={otherSessions}
                  keyExtractor={(item) => item.index.toString()}
                  renderItem={renderSessionItem}
                />
              </View>
            )}
          </View>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>
            <T keyName="generic.cancel.button" />
          </Button>
          <Button
            onPress={handleCopy}
            disabled={
              selectedSessionIndex === undefined || otherSessions.length === 0
            }
          >
            <T keyName="generic.copy.button" />
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
