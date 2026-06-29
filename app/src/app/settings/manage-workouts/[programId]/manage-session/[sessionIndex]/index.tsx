import ConfirmationDialog from '@/components/presentation/foundation/confirmation-dialog';
import EmptyInfo from '@/components/presentation/foundation/empty-info';
import ExerciseBlueprintSummary from '@/components/presentation/workout-editor/exercise-blueprint-summary';
import FloatingBottomContainer from '@/components/presentation/foundation/floating-bottom-container';
import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import ItemList from '@/components/presentation/foundation/item-list';
import Form from '@/components/presentation/foundation/form';
import LabelledFormRow from '@/components/presentation/foundation/labelled-form-row';
import LimitedHtml from '@/components/presentation/foundation/limited-html';
import CopyExerciseDialog from '@/components/smart/copy-exercise-dialog';
import { spacing } from '@/hooks/useAppTheme';
import {
  WeightedExerciseBlueprint,
  Rest,
  SessionBlueprint,
  ExerciseBlueprint,
  IncreaseLowestSetProgressiveOverload,
} from '@/models/blueprint-models';
import { RootState, useAppSelector } from '@/store';
import { setProgramSession } from '@/store/program';
import {
  addExercise,
  moveExerciseDown,
  moveExerciseUp,
  removeExercise,
  selectCurrentlyEditingSession,
  setEditingExerciseIndex,
  setEditingSessionName,
  setEditingSessionNotes,
} from '@/store/session-editor';
import { T, useTranslate } from '@tolgee/react';
import BigNumber from 'bignumber.js';
import { Redirect, Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Card, FAB, TextInput } from 'react-native-paper';
import { useDispatch, useStore } from 'react-redux';

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
  return <SessionEditor session={session} sessionIndex={sessionIndex} programId={programId} />;
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
  const { getState } = useStore<RootState>();
  const [selectedExercise, setSelectedExercise] = useState<ExerciseBlueprint | undefined>(undefined);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const exerciseCount = useAppSelector((x) => x.sessionEditor.sessionBlueprint?.exercises?.length ?? 0);
  const { push } = useRouter();
  const openExerciseEditor = (exerciseIndex: number | undefined) => {
    dispatch(setEditingExerciseIndex(exerciseIndex));

    push(`/settings/manage-workouts/${programId}/manage-session/${sessionIndex}/exercise`);
  };
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
  useFocusEffect(() => {
    saveSession();
  });
  const beginAddExercise = () => {
    dispatch(
      addExercise(
        WeightedExerciseBlueprint.empty().with({
          name: `Exercise ${session.exercises.length + 1}`,
          repsPerSet: 10,
          sets: 3,
          progressiveOverload: new IncreaseLowestSetProgressiveOverload(BigNumber('2.5'), 'all'),
          link: '',
          notes: '',
          restBetweenSets: Rest.medium,
          supersetWithNext: false,
        }),
      ),
    );
    openExerciseEditor(exerciseCount);
  };
  const setName = (name: string) => {
    dispatch(setEditingSessionName(name));
    saveSession();
  };
  const setNotes = (notes: string) => {
    dispatch(setEditingSessionNotes(notes));
    saveSession();
  };

  const floatingBottomContainer = (
    <FloatingBottomContainer
      fab={
        <FAB variant="surface" size="small" icon={'add'} label={t('exercise.add.title')} onPress={beginAddExercise} />
      }
    />
  );
  return (
    <FullHeightScrollView floatingChildren={floatingBottomContainer}>
      <Stack.Screen options={{ title: session.name }} />
      <Form>
        <LabelledFormRow label={t('workout.name.label')} icon={'assignmentFill'}>
          <TextInput mode="flat" value={session.name} onChangeText={setName} selectTextOnFocus />
        </LabelledFormRow>
        <LabelledFormRow label={t('workout.notes.label')} icon={'notesFill'}>
          <TextInput mode="flat" value={session.notes} onChangeText={setNotes} multiline />
        </LabelledFormRow>
        <LabelledFormRow label={t('exercise.exercises.title')} icon={'fitnessCenterFill'} undoFormPadding noGap>
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
                  openExerciseEditor(index);
                }}
                beginRemove={() => {
                  setSelectedExercise(blueprint);
                  setIsRemoveOpen(true);
                }}
                saveSession={saveSession}
              />
            )}
          />
        </LabelledFormRow>
      </Form>
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
