import ConfirmationDialog from '@/components/presentation/foundation/confirmation-dialog';
import EmptyInfo from '@/components/presentation/foundation/empty-info';
import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import Form from '@/components/presentation/foundation/form';
import LimitedHtml from '@/components/presentation/foundation/limited-html';
import { PageActions } from '@/components/presentation/foundation/page-actions';
import { TitledSection } from '@/components/presentation/foundation/titled-section';
import { SegmentedGroup, SegmentedListItem } from '@/components/presentation/foundation/segmented-list';
import { SegmentedListTextInput } from '@/components/presentation/foundation/segmented-list-text-input';
import { ExerciseBlueprintRow } from '@/components/presentation/workout-editor/exercise-blueprint-row';
import { SupersetLink } from '@/components/presentation/workout-editor/superset-link';
import AddIcon from '@expo/material-symbols/add.xml';
import CopyExerciseDialog from '@/components/smart/copy-exercise-dialog';
import { useReorderToolbarItem } from '@/components/smart/reorder-toolbar-item';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { usePreferredWeightUnit } from '@/hooks/usePreferredWeightUnit';
import { WeightedExerciseBlueprint, Rest, SessionBlueprint, ExerciseBlueprint } from '@/models/blueprint-models';
import { Session } from '@/models/session-models';
import { useAppSelector } from '@/store';
import { ProgramSessionLocation, selectProgramSession, updateProgram } from '@/store/program';
import { groupSupersets } from '@/utils/superset-groups';
import { T, useTranslate } from '@tolgee/react';
import { Redirect, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Fragment, useState } from 'react';
import { View } from 'react-native';
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

type UpdateSession = (update: (session: SessionBlueprint) => SessionBlueprint) => void;

function SessionEditor({ session, location }: { session: SessionBlueprint; location: ProgramSessionLocation }) {
  const dispatch = useDispatch();
  const { colors } = useAppTheme();
  const preferredWeightUnit = usePreferredWeightUnit();
  const updateSession: UpdateSession = (update) => {
    dispatch(
      updateProgram({
        programId: location.programId,
        update: (program) => program.withSession(location.sessionIndex, update),
      }),
    );
  };
  const [exerciseToRemove, setExerciseToRemove] = useState<ExerciseBlueprint | undefined>(undefined);
  const [exerciseToCopy, setExerciseToCopy] = useState<ExerciseBlueprint | undefined>(undefined);
  const [reordering, setReordering] = useState(false);
  const reorderToolbarItem = useReorderToolbarItem({
    reordering,
    onToggle: () => setReordering(!reordering),
    hidden: session.exercises.length < 2,
  });
  const { push } = useRouter();
  const { t } = useTranslate();

  const openExerciseEditor = (exerciseIndex: number) => {
    push({
      pathname: '/plan-workout-editor/[programId]/[sessionIndex]/exercise',
      params: { ...location, exerciseIndex },
    });
  };
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
  const toggleSupersetWithNext = (index: number) => {
    const exercise = session.exercises[index];
    if (exercise instanceof WeightedExerciseBlueprint) {
      updateSession((s) => s.withExercise(index, exercise.with({ supersetWithNext: !exercise.supersetWithNext })));
    }
  };

  const groups = groupSupersets(Session.getEmptySession(session, preferredWeightUnit).recordedExercises);
  const lastIndex = session.exercises.length - 1;
  const seamAbove = (index: number) => {
    if (!reordering || index === 0) {
      return undefined;
    }
    const above = session.exercises[index - 1];
    return above instanceof WeightedExerciseBlueprint ? (
      <SupersetLink linked={above.supersetWithNext} onToggle={() => toggleSupersetWithNext(index - 1)} />
    ) : (
      <View style={{ height: spacing[6] }} />
    );
  };

  const floatingBottomContainer = reordering ? undefined : (
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
    <FullHeightScrollView floatingChildren={floatingBottomContainer} modal>
      <Stack.Screen options={{ title: session.name }} />
      <Stack.Toolbar placement="right">{reorderToolbarItem}</Stack.Toolbar>
      <Form>
        <SegmentedGroup>
          <SegmentedListTextInput
            label={t('generic.name.label')}
            value={session.name}
            onChangeText={(name) => updateSession((s) => s.withName(name))}
            selectTextOnFocus
          />
          <SegmentedListTextInput
            label={t('generic.notes.label')}
            value={session.notes}
            onChangeText={(notes) => updateSession((s) => s.withNotes(notes))}
            multiline
          />
        </SegmentedGroup>

        <TitledSection
          title={t('exercise.exercises.title')}
          trailing={
            session.exercises.length
              ? t(session.exercises.length === 1 ? 'plan.summary.exercise' : 'plan.summary.exercises', {
                  count: session.exercises.length,
                })
              : undefined
          }
        >
          {session.exercises.length ? (
            <View style={{ gap: reordering ? 0 : spacing[0.5] }}>
              {groups.map((group) => (
                <Fragment key={group.members[0]!.index}>
                  {seamAbove(group.members[0]!.index)}
                  <View style={{ gap: reordering ? 0 : spacing[0.5] }}>
                    {group.isSuperset ? (
                      <View
                        style={{
                          position: 'absolute',
                          left: -(spacing.pageHorizontalMargin + spacing[1]) / 2,
                          top: spacing[3],
                          bottom: spacing[3],
                          width: spacing[1],
                          borderRadius: spacing[0.5],
                          backgroundColor: colors.tertiary,
                        }}
                      />
                    ) : undefined}
                    {group.members.map(({ index, label }, memberIndex) => {
                      const blueprint = session.exercises[index]!;
                      return (
                        <Fragment key={index}>
                          {memberIndex > 0 ? seamAbove(index) : undefined}
                          <SegmentedListItem
                            isFirst={reordering ? memberIndex === 0 : index === 0}
                            isLast={reordering ? memberIndex === group.members.length - 1 : index === lastIndex}
                          >
                            <ExerciseBlueprintRow
                              blueprint={blueprint}
                              supersetLabel={label}
                              reordering={reordering}
                              canMoveUp={index > 0}
                              canMoveDown={index < lastIndex}
                              onEdit={() => openExerciseEditor(index)}
                              onMoveUp={() => updateSession((s) => s.withExerciseMovedUp(blueprint))}
                              onMoveDown={() => updateSession((s) => s.withExerciseMovedDown(blueprint))}
                              onRemove={() => setExerciseToRemove(blueprint)}
                              onCopyTo={() => setExerciseToCopy(blueprint)}
                            />
                          </SegmentedListItem>
                        </Fragment>
                      );
                    })}
                  </View>
                </Fragment>
              ))}
            </View>
          ) : (
            <SegmentedListItem isFirst isLast>
              <View style={{ padding: spacing[4] }}>
                <EmptyInfo>
                  <T keyName="exercise.no_exercises_added.message" />
                </EmptyInfo>
              </View>
            </SegmentedListItem>
          )}
        </TitledSection>
      </Form>
      <ConfirmationDialog
        headline={t('exercise.remove.confirm.title')}
        onOk={() => {
          const selected = exerciseToRemove;
          setExerciseToRemove(undefined);
          if (selected) updateSession((s) => s.withoutExercise(selected));
        }}
        onCancel={() => setExerciseToRemove(undefined)}
        open={!!exerciseToRemove}
        textContent={
          <LimitedHtml
            value={t('exercise.remove_from_workout.confirm.body', {
              exercise: exerciseToRemove?.name ?? '',
              session: session.name,
            })}
          />
        }
      />
      {exerciseToCopy ? (
        <CopyExerciseDialog
          visible
          onDismiss={() => setExerciseToCopy(undefined)}
          exerciseBlueprint={exerciseToCopy}
          currentSessionIndex={location.sessionIndex}
          programId={location.programId}
        />
      ) : undefined}
    </FullHeightScrollView>
  );
}
