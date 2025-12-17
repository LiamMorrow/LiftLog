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
import CopyExerciseDialog from '@/components/smart/copy-exercise-dialog';
import { spacing } from '@/hooks/useAppTheme';
import {
  WeightedExerciseBlueprint,
  Rest,
  SessionBlueprint,
  ExerciseBlueprint,
} from '@/models/blueprint-models';
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
      WeightedExerciseBlueprint.fromPOJO({
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
  const setName = (name: string) => {
    dispatch(setEditingSessionName(name));
    saveSession();
  };
  const setNotes = (notes: string) => {
    dispatch(setEditingSessionNotes(notes));
    saveSession();
  };
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
          icon={'add'}
          label={t('exercise.add.title')}
          onPress={beginAddExercise}
        />
      }
    />
  );
  return (
    <FullHeightScrollView floatingChildren={floatingBottomContainer}>
      <Stack.Screen options={{ title: session.name }} />
      <LabelledForm>
        <LabelledFormRow
          label={t('workout.name.label')}
          icon={'assignmentFill'}
        >
          <TextInput
            mode="flat"
            value={session.name}
            onChangeText={setName}
            selectTextOnFocus
          />
        </LabelledFormRow>
        <LabelledFormRow label={t('workout.notes.label')} icon={'notesFill'}>
          <TextInput
            mode="flat"
            value={session.notes}
            onChangeText={setNotes}
            multiline
          />
        </LabelledFormRow>
        <LabelledFormRow
          label={t('exercise.exercises.title')}
          icon={'fitnessCenterFill'}
          undoFormPadding
          noGap
        >
          <ItemList
            items={session.exercises}
            verticalPadding={false}
            empty={
              <Card mode="contained" style={{ marginHorizontal: spacing[6] }}>
                <Card.Content>
                  <EmptyInfo>
                    <T keyName="exercise.no_exercises_added.message" />
                  </EmptyInfo>
                </Card.Content>
              </Card>
            }
            renderItem={(blueprint, index) => (
              <ExerciseItem
                blueprint={blueprint}
                sessionIndex={sessionIndex}
                programId={programId}
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
                saveSession={saveSession}
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
            ? t('exercise.add.title')
            : t('exercise.edit.title')
        }
        action={t('generic.save.button')}
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
        headline={t('exercise.remove.confirm.title')}
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
            value={t('exercise.remove_from_workout.confirm.body', {
              exercise: selectedExercise?.name ?? '',
              session: session.name,
            })}
          />
        }
      />
    </FullHeightScrollView>
  );
}

function ExerciseItem({
  blueprint,
  beginEdit,
  beginRemove,
  sessionIndex,
  programId,
  saveSession,
}: {
  blueprint: ExerciseBlueprint;
  beginEdit: () => void;
  beginRemove: () => void;
  sessionIndex: number;
  programId: string;
  saveSession: () => void;
}) {
  const dispatch = useDispatch();
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);

  const moveDown = () => {
    dispatch(moveExerciseDown(blueprint));
    saveSession();
  };
  const moveUp = () => {
    dispatch(moveExerciseUp(blueprint));
    saveSession();
  };

  return (
    <>
      <ExerciseBlueprintSummary
        blueprint={blueprint}
        onEdit={beginEdit}
        onMoveDown={moveDown}
        onMoveUp={moveUp}
        onRemove={beginRemove}
        onCopyTo={() => setCopyDialogOpen(true)}
      />
      <CopyExerciseDialog
        visible={copyDialogOpen}
        onDismiss={() => setCopyDialogOpen(false)}
        exerciseBlueprint={blueprint}
        currentSessionIndex={sessionIndex}
        programId={programId}
      />
    </>
  );
}
