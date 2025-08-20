import { spacing } from '@/hooks/useAppTheme';
import { ExerciseBlueprint, SessionBlueprint } from '@/models/session-models';
import { useAppSelectorWithArg } from '@/store';
import { showSnackbar } from '@/store/app';
import { selectProgram, setProgramSession } from '@/store/program';
import { T, useTranslate } from '@tolgee/react';
import { useState } from 'react';
import { FlatList, View } from 'react-native';
import {
  Button,
  Dialog,
  List,
  Portal,
  RadioButton,
  Text,
} from 'react-native-paper';
import { useDispatch } from 'react-redux';

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
  const [selectedSessionIndex, setSelectedSessionIndex] = useState<number>(-1);

  // Filter out the current session and map sessions to have indices
  const otherSessions = program.sessions
    .map((session, index) => ({ session, index }))
    .filter(({ index }) => index !== currentSessionIndex);

  const handleCopy = () => {
    if (selectedSessionIndex !== -1) {
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
          text: t('Exercise {exerciseName} copied to {targetSessionName}', {
            exerciseName: exerciseBlueprint.name,
            targetSessionName: targetSession.name,
          }),
        }),
      );

      onDismiss();
      setSelectedSessionIndex(-1); // Reset selection
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
          <T keyName="Copy exercise to session" />
        </Dialog.Title>
        <Dialog.Content>
          <View style={{ gap: spacing[2] }}>
            <Text variant="bodyMedium">
              <T
                keyName="Select a session to copy {exerciseName} to"
                params={{ exerciseName: exerciseBlueprint.name }}
              />
            </Text>
            {otherSessions.length === 0 ? (
              <Text variant="bodyMedium" style={{ fontStyle: 'italic' }}>
                <T keyName="No other sessions available" />
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
            <T keyName="Cancel" />
          </Button>
          <Button
            onPress={handleCopy}
            disabled={selectedSessionIndex === -1 || otherSessions.length === 0}
          >
            <T keyName="Copy" />
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
