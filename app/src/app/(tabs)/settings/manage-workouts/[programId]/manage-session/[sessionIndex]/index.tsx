import ConfirmationDialog from '@/components/presentation/foundation/confirmation-dialog';
import EmptyInfo from '@/components/presentation/foundation/empty-info';
import ExerciseBlueprintSummary from '@/components/presentation/workout-editor/exercise-blueprint-summary';
import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import ItemList from '@/components/presentation/foundation/item-list';
import Form from '@/components/presentation/foundation/form';
import LabelledFormRow from '@/components/presentation/foundation/labelled-form-row';
import LimitedHtml from '@/components/presentation/foundation/limited-html';
import { PageActions } from '@/components/presentation/foundation/page-actions';
import AddIcon from '@expo/material-symbols/add.xml';
import CopyExerciseDialog from '@/components/smart/copy-exercise-dialog';
import { spacing } from '@/hooks/useAppTheme';
import { WeightedExerciseBlueprint, Rest, SessionBlueprint, ExerciseBlueprint } from '@/models/blueprint-models';
import { useAppSelector } from '@/store';
import { ProgramSessionLocation, selectProgramSession, updateProgram } from '@/store/program';
import { T, useTranslate } from '@tolgee/react';
import { Redirect, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Card, TextInput } from 'react-native-paper';
import { useDispatch } from 'react-redux';

export default function ManageWorkouts() {
  const { sessionIndex: sessionIndexStr, programId } = useLocalSearchParams<{
    sessionIndex: string;
    programId: string;
  }>();
  const location = { programId, sessionIndex: Number(sessionIndexStr) };
  const session = useAppSelector((x) => selectProgramSession(x, location));
  if (!session) {
    return <Redirect href={'/'} />;
  }
  return <SessionEditor session={session} location={location} />;
}

function SessionEditor({ session, location }: { session: SessionBlueprint; location: ProgramSessionLocation }) {
  const dispatch = useDispatch();
  const updateSession = (update: (session: SessionBlueprint) => SessionBlueprint) => {
    dispatch(
      updateProgram({
        programId: location.programId,
        update: (program) => program.withSession(location.sessionIndex, update),
      }),
    );
  };
  const [selectedExercise, setSelectedExercise] = useState<ExerciseBlueprint | undefined>(undefined);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const { push } = useRouter();
  const openExerciseEditor = (exerciseIndex: number) => {
    push({
      pathname: '/settings/manage-workouts/[programId]/manage-session/[sessionIndex]/exercise',
      params: { ...location, exerciseIndex },
    });
  };
  const { t } = useTranslate();
  const beginAddExercise = () => {
    updateSession((s) =>
      s.withAddedExercise(
        WeightedExerciseBlueprint.empty().with({
          name: `Exercise ${session.exercises.length + 1}`,
          repsConfig: { type: 'fixed', reps: 10 },
          sets: 3,
          link: '',
          notes: '',
          restBetweenSets: Rest.medium,
          supersetWithNext: false,
        }),
      ),
    );
    openExerciseEditor(session.exercises.length);
  };
  const setName = (name: string) => {
    updateSession((s) => s.withName(name));
  };
  const setNotes = (notes: string) => {
    updateSession((s) => s.withNotes(notes));
  };

  const floatingBottomContainer = (
    <PageActions
      primary={{
        label: t('exercise.add.title'),
        icon: AddIcon,
        systemImage: 'plus',
        onPress: beginAddExercise,
      }}
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
                location={location}
                updateSession={updateSession}
                beginEdit={() => {
                  openExerciseEditor(index);
                }}
                beginRemove={() => {
                  setSelectedExercise(blueprint);
                  setIsRemoveOpen(true);
                }}
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
          if (selected) updateSession((s) => s.withoutExercise(selected));
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
  location,
  updateSession,
}: {
  blueprint: ExerciseBlueprint;
  beginEdit: () => void;
  beginRemove: () => void;
  location: ProgramSessionLocation;
  updateSession: (update: (session: SessionBlueprint) => SessionBlueprint) => void;
}) {
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);

  const moveDown = () => {
    updateSession((s) => s.withExerciseMovedDown(blueprint));
  };
  const moveUp = () => {
    updateSession((s) => s.withExerciseMovedUp(blueprint));
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
        currentSessionIndex={location.sessionIndex}
        programId={location.programId}
      />
    </>
  );
}
