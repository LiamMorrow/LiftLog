import ConfirmationDialog from '@/components/presentation/confirmation-dialog';
import EmptyInfo from '@/components/presentation/empty-info';
import ExerciseBlueprintSummary from '@/components/presentation/exercise-blueprint-summary';
import { ExerciseEditor } from '@/components/presentation/exercise-editor';
import FloatingBottomContainer from '@/components/presentation/floating-bottom-container';
import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import FullScreenDialog from '@/components/presentation/full-screen-dialog';
import ItemList from '@/components/presentation/item-list';
import LabelledForm from '@/components/presentation/labelled-form';
import LabelledFormRow from '@/components/presentation/labelled-form-row';
import LimitedHtml from '@/components/presentation/limited-html';
import {
  ExerciseBlueprint,
  Rest,
  SessionBlueprint,
} from '@/models/session-models';
import { useAppSelector } from '@/store';
import { setProgramSession } from '@/store/program';
import {
  addExercise,
  moveExerciseDown,
  moveExerciseUp,
  removeExercise,
  selectCurrentlyEditingSession,
  setEditingSessionName,
  setEditingSessionNotes,
  updateSessionExercise,
} from '@/store/session-editor';
import { getState } from '@/store/store';
import { T, useTranslate } from '@tolgee/react';
import BigNumber from 'bignumber.js';
import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Card, FAB, TextInput } from 'react-native-paper';
import { useDispatch } from 'react-redux';

export default function ManageWorkouts() {
  const { sessionIndex: sessionIndexStr, programId } = useLocalSearchParams<{
    sessionIndex: string;
    programId: string;
  }>();
  const sessionIndex = Number(sessionIndexStr);
  const session = useAppSelector(selectCurrentlyEditingSession);
  if (!session) {
    return <Redirect href={'/'} />;
  }
  return (
    <SessionEditor
      session={session}
      sessionIndex={sessionIndex}
      programId={programId}
    />
  );
}

function SessionEditor({
  session,
  programId,
  sessionIndex,
}: {
  session: SessionBlueprint;
  programId: string;
  sessionIndex: number;
}) {
  const dispatch = useDispatch();
  const [selectedExercise, setSelectedExercise] = useState<
    ExerciseBlueprint | undefined
  >(undefined);
  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState<
    number | undefined
  >(undefined);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { t } = useTranslate();
  const saveSession = () => {
    // We need to get it again, as we likely dispatched, but the 'session' var will not have updated yet
    const currentSession = selectCurrentlyEditingSession(getState());
    if (!currentSession) return;
    dispatch(
      setProgramSession({
        programId,
        sessionIndex,
        sessionBlueprint: currentSession,
      }),
    );
  };
  const beginAddExercise = () => {
    setSelectedExerciseIndex(undefined);
    setSelectedExercise(
      ExerciseBlueprint.fromPOJO({
        name: `Exercise ${session.exercises.length + 1}`,
        repsPerSet: 10,
        sets: 3,
        weightIncreaseOnSuccess: BigNumber('2.5'),
        link: '',
        notes: '',
        restBetweenSets: Rest.medium,
        supersetWithNext: false,
      }),
    );
    setIsEditOpen(true);
  };
  const setName = (name: string) => dispatch(setEditingSessionName(name));
  const setNotes = (notes: string) => dispatch(setEditingSessionNotes(notes));
  const saveExercise = () => {
    if (!selectedExercise) {
      return;
    }
    if (selectedExerciseIndex !== undefined) {
      dispatch(
        updateSessionExercise({
          index: selectedExerciseIndex,
          exercise: selectedExercise,
        }),
      );
    } else {
      dispatch(addExercise(selectedExercise));
    }
    saveSession();
    setIsEditOpen(false);
  };

  const floatingBottomContainer = (
    <FloatingBottomContainer
      fab={
        <FAB
          variant="surface"
          size="small"
          icon="add"
          label={t('AddExercise')}
          onPress={beginAddExercise}
        />
      }
    />
  );
  return (
    <FullHeightScrollView floatingChildren={floatingBottomContainer}>
      <Stack.Screen options={{ title: session.name }} />
      <LabelledForm>
        <LabelledFormRow label={t('WorkoutName')} icon="assignment">
          <TextInput
            mode="flat"
            value={session.name}
            onChangeText={setName}
            selectTextOnFocus
          />
        </LabelledFormRow>
        <LabelledFormRow label={t('WorkoutNotes')} icon="notes">
          <TextInput
            mode="flat"
            value={session.notes}
            onChangeText={setNotes}
            multiline
          />
        </LabelledFormRow>
        <LabelledFormRow
          label={t('Exercises')}
          icon="fitness_center"
          undoFormPadding={true}
        >
          <ItemList
            items={session.exercises}
            verticalPadding={false}
            empty={
              <Card mode="contained">
                <Card.Content>
                  <EmptyInfo>
                    <T keyName="NoExercisesAdded" />
                  </EmptyInfo>
                </Card.Content>
              </Card>
            }
            renderItem={(blueprint, index) => (
              <ExerciseItem
                blueprint={blueprint}
                index={index}
                beginEdit={() => {
                  setSelectedExerciseIndex(index);
                  setSelectedExercise(blueprint);
                  setIsEditOpen(true);
                }}
                beginRemove={() => {
                  setSelectedExercise(blueprint);
                  setIsRemoveOpen(true);
                  setSelectedExerciseIndex(index);
                }}
              />
            )}
          />
        </LabelledFormRow>
      </LabelledForm>
      <FullScreenDialog
        open={!!selectedExercise && isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={
          selectedExerciseIndex === undefined
            ? t('AddExercise')
            : t('EditExercise')
        }
        action={t('Save')}
        onAction={saveExercise}
      >
        {selectedExercise && (
          <ExerciseEditor
            exercise={selectedExercise}
            updateExercise={setSelectedExercise}
          />
        )}
      </FullScreenDialog>
      <ConfirmationDialog
        headline={t('RemoveExerciseQuestion')}
        onOk={() => {
          const selected = selectedExercise;
          setSelectedExercise(undefined);
          setIsRemoveOpen(false);
          if (selected) dispatch(removeExercise(selected));
          saveSession();
        }}
        onCancel={() => setIsRemoveOpen(false)}
        open={!!selectedExercise && isRemoveOpen}
        textContent={
          <LimitedHtml
            value={t('RemoveExerciseFromWorkoutMessage{Exercise}{Session}', {
              0: selectedExercise?.name ?? '',
              1: session.name,
            })}
          />
        }
      />
    </FullHeightScrollView>
  );
}

function ExerciseItem({
  index,
  blueprint,
  beginEdit,
  beginRemove,
}: {
  index: number;
  blueprint: ExerciseBlueprint;
  beginEdit: () => void;
  beginRemove: () => void;
}) {
  const dispatch = useDispatch();

  const moveDown = () => dispatch(moveExerciseDown(blueprint));
  const moveUp = () => dispatch(moveExerciseUp(blueprint));
  return (
    <ExerciseBlueprintSummary
      blueprint={blueprint}
      onEdit={beginEdit}
      onMoveDown={moveDown}
      onMoveUp={moveUp}
      onRemove={beginRemove}
    />
  );
}
