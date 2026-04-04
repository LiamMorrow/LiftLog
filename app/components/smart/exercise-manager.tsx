import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import ConfirmationDialog from '@/components/presentation/foundation/confirmation-dialog';
import { useTranslate } from '@tolgee/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, View } from 'react-native';
import {
  AnimatedFAB,
  Icon,
  List,
  Portal,
  Dialog,
  Text,
  TextInput,
} from 'react-native-paper';
import TouchableRipple from '@/components/presentation/foundation/gesture-wrappers/touchable-ripple';
import { AccordionItem } from '@/components/presentation/foundation/accordion-item';
import { useScroll } from '@/hooks/useScrollListener';
import {
  deleteExercise as deleteExerciseAction,
  ExerciseDescriptor,
  selectExerciseById,
  selectExercises,
  setExercises,
  setFilteredExerciseIds as setFilteredExerciseIdsAction,
  setStoredSessions,
  updateExercise,
} from '@/store/stored-sessions';
import { RootState, useAppSelector, useAppSelectorWithArg } from '@/store';
import { useDispatch } from 'react-redux';
import { uuid } from '@/utils/uuid';
import { SwipeRow } from 'react-native-swipe-list-view';
import { showSnackbar } from '@/store/app';
import { useMountEffect } from '@/hooks/useMountEffect';
import ExerciseMuscleSelector from '@/components/presentation/workout-editor/exercise-muscle-selector';
import ExerciseFilterer from '@/components/presentation/workout-editor/exercise-filterer';
import { LegendList } from '@legendapp/list';
import { getState } from '@/store/store';
import Button from '@/components/presentation/foundation/gesture-wrappers/button';
import {
  NormalizedName,
  ProgramBlueprint,
  SessionBlueprint,
} from '@/models/blueprint-models';
import { fetchUpcomingSessions, setSavedPlans } from '@/store/program';
import { Session, SessionPOJO } from '@/models/session-models';
import { SessionTarget, setCurrentSession } from '@/store/current-session';
import { setEditingSession } from '@/store/session-editor';
import { setStatsIsDirty } from '@/store/stats';

type RenameImpact = {
  renamedCount: number;
  mergedCount: number;
};

function renameExerciseBlueprintPOJOName<T extends { name: string }>(
  exercise: T,
  oldName: string,
  newName: string,
): T {
  if (exercise.name !== oldName) {
    return exercise;
  }
  return { ...exercise, name: newName };
}

function renameSessionPOJO(
  session: SessionPOJO,
  oldName: string,
  newName: string,
) {
  return {
    ...session,
    blueprint: {
      ...session.blueprint,
      exercises: session.blueprint.exercises.map((exercise) =>
        renameExerciseBlueprintPOJOName(exercise, oldName, newName),
      ),
    },
    recordedExercises: session.recordedExercises.map((exercise) => {
      if (exercise.type === 'RecordedCardioExercise') {
        return {
          ...exercise,
          blueprint: renameExerciseBlueprintPOJOName(
            exercise.blueprint,
            oldName,
            newName,
          ),
        };
      }
      return {
        ...exercise,
        blueprint: renameExerciseBlueprintPOJOName(
          exercise.blueprint,
          oldName,
          newName,
        ),
      };
    }),
  } satisfies SessionPOJO;
}

function mergeExerciseDescriptors(
  base: ExerciseDescriptor,
  incoming: ExerciseDescriptor,
  name: string,
): ExerciseDescriptor {
  return {
    name,
    category: base.category || incoming.category,
    equipment: base.equipment ?? incoming.equipment,
    force: base.force ?? incoming.force,
    instructions: base.instructions || incoming.instructions,
    level: base.level || incoming.level,
    mechanic: base.mechanic ?? incoming.mechanic,
    muscles: Array.from(new Set([...base.muscles, ...incoming.muscles])).sort(),
  };
}

function renameSavedExercises(
  savedExercises: Record<string, ExerciseDescriptor>,
  oldName: string,
  newName: string,
) {
  const newNormalizedName = new NormalizedName(newName).toString();
  const oldIds = Object.entries(savedExercises)
    .filter(([, exercise]) => exercise.name === oldName)
    .map(([id]) => id);
  const mergeTargetIds = Object.entries(savedExercises)
    .filter(
      ([, exercise]) =>
        exercise.name !== oldName &&
        new NormalizedName(exercise.name).toString() === newNormalizedName,
    )
    .map(([id]) => id);

  if (!oldIds.length) {
    return savedExercises;
  }

  const keeperId = mergeTargetIds[0] ?? oldIds[0];
  const mergedDescriptors = [...mergeTargetIds, ...oldIds]
    .map((id) => savedExercises[id])
    .reduce<ExerciseDescriptor | undefined>((accum, exercise) => {
      return accum
        ? mergeExerciseDescriptors(accum, exercise, newName)
        : { ...exercise, name: newName };
    }, undefined);

  const nextExercises = { ...savedExercises };
  [...new Set([...mergeTargetIds, ...oldIds])].forEach((id) => {
    delete nextExercises[id];
  });
  nextExercises[keeperId] = mergedDescriptors!;
  return nextExercises;
}

function buildRenameImpact(
  state: RootState,
  oldName: string,
  newName: string,
): RenameImpact {
  const allExerciseNames = [
    ...Object.values(state.storedSessions.savedExercises).map((x) => x.name),
    ...Object.values(state.storedSessions.sessions).flatMap((session) =>
      session.recordedExercises.map((exercise) => exercise.blueprint.name),
    ),
    ...Object.values(state.program.savedPrograms).flatMap((program) =>
      program.sessions.flatMap((session) =>
        session.exercises.map((exercise) => exercise.name),
      ),
    ),
  ];
  const newNormalizedName = new NormalizedName(newName).toString();
  return {
    renamedCount: allExerciseNames.filter((name) => name === oldName).length,
    mergedCount: allExerciseNames.filter(
      (name) =>
        name !== oldName &&
        new NormalizedName(name).toString() === newNormalizedName,
    ).length,
  };
}

function renameOpenSessions(
  state: RootState,
  oldName: string,
  newName: string,
) {
  const targets: SessionTarget[] = [
    'workoutSession',
    'historySession',
    'feedSession',
    'sharedSession',
  ];
  return targets
    .map((target) => ({
      target,
      session: state.currentSession[target],
    }))
    .filter((x) => x.session)
    .map((x) => ({
      target: x.target,
      session: Session.fromPOJO(
        renameSessionPOJO(x.session as SessionPOJO, oldName, newName),
      ),
    }));
}

function ExerciseListItem({
  exerciseId,
  expand,
  onDelete,
}: {
  exerciseId: string;
  expand: boolean;
  onDelete: () => void;
}) {
  const { colors } = useAppTheme();
  const exercise = useAppSelectorWithArg(selectExerciseById, exerciseId);
  const [expanded, setExpanded] = useState(expand);
  const [listExpanded, setListExpanded] = useState(expand);

  const rowRef = useRef<SwipeRow<unknown>>(null);
  useEffect(() => {
    rowRef.current?.closeRowWithoutAnimation();
  }, [exerciseId]);
  if (!exercise) {
    return <View></View>;
  }

  return (
    // @ts-expect-error -- Swipe row seems to have trouble with typescript, it works
    <SwipeRow
      disableRightSwipe
      ref={rowRef}
      rightActivationValue={-70}
      rightActionValue={-70}
      rightOpenValue={-70}
    >
      <View
        style={{
          alignItems: 'flex-end',
          justifyContent: 'center',
          flex: 1,
          paddingVertical: 4,
        }}
      >
        <TouchableRipple
          onPress={onDelete}
          style={{
            height: '100%',
            width: 70,
            backgroundColor: colors.error,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          testID={`exercise-delete-btn`}
        >
          <Icon source={'delete'} size={30} color={colors.onError} />
        </TouchableRipple>
      </View>
      <List.Accordion
        title={exercise.name}
        // Important to have a space to ensure they are all the same size
        // Otherwise delete button can show through when there is no desc
        description={exercise.muscles.join(', ') || ' '}
        descriptionNumberOfLines={1}
        expanded={listExpanded}
        onPress={() => {
          if (rowRef.current?.isOpen) {
            return;
          }
          if (!expanded) {
            setListExpanded(true);
            setExpanded(true);
          } else {
            setExpanded(false);
          }
        }}
        testID={`exercise-accordion`}
      >
        <AccordionItem
          isExpanded={expanded}
          onToggled={(isOpen) => {
            setExpanded(isOpen);
            if (!isOpen) {
              // Wait until collapse finishes before unmounting
              setListExpanded(false);
            }
          }}
        >
          <ExerciseEditSheet exercise={exercise} exerciseId={exerciseId} />
        </AccordionItem>
      </List.Accordion>
    </SwipeRow>
  );
}

export default function ExerciseManager() {
  const dispatch = useDispatch();
  const { t } = useTranslate();
  const exercises = useAppSelector(selectExercises);
  const filteredExerciseIds = useAppSelector(
    (s) => s.storedSessions.filteredExerciseIds,
  );
  const setFilteredExerciseIds = (ids: string[]) => {
    dispatch(setFilteredExerciseIdsAction(ids));
  };

  useMountEffect(() => {
    setFilteredExerciseIds(Object.keys(exercises));
  });

  const addExercise = () => {
    const newId = uuid();
    dispatch(
      updateExercise({
        id: newId,
        exercise: {
          name: 'New exercise',
          category: '',
          equipment: null,
          force: null,
          instructions: '',
          level: 'beginner',
          mechanic: null,
          muscles: [],
        },
      }),
    );
    setFilteredExerciseIds([newId]);
  };

  const deleteExercise = (id: string) => {
    const exercise = getState().storedSessions.savedExercises[id];
    if (!exercise) {
      return;
    }

    setFilteredExerciseIds(filteredExerciseIds.filter((x) => x !== id));
    dispatch(deleteExerciseAction(id));
    dispatch(
      showSnackbar({
        text: t('deletion.item_deleted.message', { name: exercise.name }),
        action: t('generic.undo.button'),
        dispatchAction: [
          updateExercise({ id, exercise }),
          setFilteredExerciseIdsAction(filteredExerciseIds),
        ],
      }),
    );
  };

  const flatListItems = useMemo(
    () => ['filter', ...filteredExerciseIds],
    [filteredExerciseIds],
  );
  const { handleScroll } = useScroll();
  const [fabExtended, setFabExtended] = useState(true);
  const [lastScrollPosition, setLastScrollPosition] = useState(0);
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    handleScroll(e);
    setFabExtended(
      e.nativeEvent.contentOffset.y <= Math.max(lastScrollPosition, 0),
    );
    setLastScrollPosition(e.nativeEvent.contentOffset.y);
  };
  return (
    <View style={{ flex: 1 }}>
      <LegendList
        onScroll={onScroll}
        style={{ flex: 1 }}
        data={flatListItems}
        getItemType={(_, index) => (index === 0 ? 'filters' : 'exercise')}
        keyExtractor={(item, index) => (index === 0 ? 'filters' : item)}
        renderItem={({ item, index }) => {
          if (index === 0) {
            return (
              <ExerciseFilterer
                onFilteredExerciseIdsChange={setFilteredExerciseIds}
              />
            );
          }
          return (
            <ExerciseListItem
              exerciseId={item}
              expand={flatListItems.length === 2}
              onDelete={() => deleteExercise(item)}
            />
          );
        }}
      />
      <AnimatedFAB
        style={{
          bottom: spacing.pageHorizontalMargin,
          right: spacing.pageHorizontalMargin,
        }}
        extended={fabExtended}
        variant="secondary"
        label={t('exercise.add.button')}
        onPress={addExercise}
        icon={'add'}
        testID="exercise-add-fab"
      />
    </View>
  );
}

function ExerciseEditSheet({
  exercise,
  exerciseId,
}: {
  exercise: ExerciseDescriptor;
  exerciseId: string;
}) {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const { colors } = useAppTheme();
  const [bulkRenameOpen, setBulkRenameOpen] = useState(false);
  const [renameConfirmOpen, setRenameConfirmOpen] = useState(false);
  const [bulkRenameValue, setBulkRenameValue] = useState(exercise.name);
  const update = (ex: Partial<ExerciseDescriptor>) => {
    dispatch(
      updateExercise({ exercise: { ...exercise, ...ex }, id: exerciseId }),
    );
  };
  useEffect(() => {
    setBulkRenameValue(exercise.name);
  }, [exercise.name]);
  const trimmedRenameValue = bulkRenameValue.trim();
  const renameImpact = useMemo(
    () => buildRenameImpact(getState(), exercise.name, trimmedRenameValue),
    [exercise.name, trimmedRenameValue],
  );
  const canBulkRename =
    !!trimmedRenameValue && trimmedRenameValue !== exercise.name;
  const handleBulkRename = () => {
    if (!canBulkRename) {
      return;
    }
    const state = getState();
    const renamedSessions = Object.fromEntries(
      Object.entries(state.storedSessions.sessions).map(([id, session]) => [
        id,
        renameSessionPOJO(session, exercise.name, trimmedRenameValue),
      ]),
    );
    const renamedPrograms = Object.fromEntries(
      Object.entries(state.program.savedPrograms).map(([id, program]) => [
        id,
        ProgramBlueprint.fromPOJO({
          ...program,
          sessions: program.sessions.map((session) => ({
            ...session,
            exercises: session.exercises.map((exerciseBlueprint) =>
              renameExerciseBlueprintPOJOName(
                exerciseBlueprint,
                exercise.name,
                trimmedRenameValue,
              ),
            ),
          })),
        }),
      ]),
    );
    const renamedExercises = renameSavedExercises(
      state.storedSessions.savedExercises,
      exercise.name,
      trimmedRenameValue,
    );

    dispatch(setStoredSessions(renamedSessions));
    dispatch(setSavedPlans(renamedPrograms));
    dispatch(setExercises(renamedExercises));
    renameOpenSessions(state, exercise.name, trimmedRenameValue).forEach(
      ({ target, session }) => {
        dispatch(setCurrentSession({ target, session }));
      },
    );
    if (state.sessionEditor.sessionBlueprint) {
      dispatch(
        setEditingSession(
          SessionBlueprint.fromPOJO({
            ...state.sessionEditor.sessionBlueprint,
            exercises: state.sessionEditor.sessionBlueprint.exercises.map(
              (exerciseBlueprint) =>
                renameExerciseBlueprintPOJOName(
                  exerciseBlueprint,
                  exercise.name,
                  trimmedRenameValue,
                ),
            ),
          }),
        ),
      );
    }
    dispatch(setFilteredExerciseIdsAction(Object.keys(renamedExercises)));
    dispatch(setStatsIsDirty(true));
    dispatch(fetchUpcomingSessions());
    dispatch(
      showSnackbar({
        text: t('exercise.bulk_rename.done.message', {
          oldName: exercise.name,
          newName: trimmedRenameValue,
          renamedCount: renameImpact.renamedCount,
        }),
      }),
    );
    setBulkRenameOpen(false);
    setRenameConfirmOpen(false);
  };
  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: spacing.pageHorizontalMargin,
        gap: spacing[2],
      }}
    >
      <TextInput
        label={t('exercise.name.label')}
        value={exercise.name}
        onChangeText={(name) => update({ name })}
        testID="exercise-name-input"
      />
      <TextInput
        label={t('generic.instructions.label')}
        value={exercise.instructions}
        onChangeText={(instructions) => update({ instructions })}
        multiline
        testID="exercise-instructions-input"
      />
      <ExerciseMuscleSelector
        muscles={exercise.muscles}
        onChange={(muscles) => update({ muscles })}
      />
      <Button onPress={() => setBulkRenameOpen(true)}>
        {t('exercise.bulk_rename.button')}
      </Button>
      <Portal>
        <Dialog
          visible={bulkRenameOpen}
          onDismiss={() => {
            setBulkRenameOpen(false);
            setRenameConfirmOpen(false);
            setBulkRenameValue(exercise.name);
          }}
        >
          <Dialog.Title>{t('exercise.bulk_rename.title')}</Dialog.Title>
          <Dialog.Content>
            <View style={{ gap: spacing[2] }}>
              <Text variant="bodyMedium">
                {t('exercise.bulk_rename.description', {
                  oldName: exercise.name,
                })}
              </Text>
              <TextInput
                label={t('exercise.bulk_rename.new_name.label')}
                value={bulkRenameValue}
                onChangeText={setBulkRenameValue}
                testID="exercise-bulk-rename-input"
              />
              {canBulkRename && (
                <Text variant="bodyMedium">
                  {t('exercise.bulk_rename.impact.message', {
                    renamedCount: renameImpact.renamedCount,
                  })}
                </Text>
              )}
              {canBulkRename && renameImpact.mergedCount > 0 && (
                <Text variant="bodyMedium" style={{ color: colors.error }}>
                  {t('exercise.bulk_rename.merge_warning.message', {
                    mergedCount: renameImpact.mergedCount,
                    newName: trimmedRenameValue,
                  })}
                </Text>
              )}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setBulkRenameOpen(false);
                setRenameConfirmOpen(false);
                setBulkRenameValue(exercise.name);
              }}
            >
              {t('generic.cancel.button')}
            </Button>
            <Button
              onPress={() => setRenameConfirmOpen(true)}
              disabled={!canBulkRename || renameImpact.renamedCount === 0}
            >
              {t('exercise.bulk_rename.button')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <ConfirmationDialog
        open={renameConfirmOpen}
        headline={t('exercise.bulk_rename.confirm.title')}
        textContent={
          renameImpact.mergedCount > 0
            ? t('exercise.bulk_rename.confirm.merge.body', {
                renamedCount: renameImpact.renamedCount,
                mergedCount: renameImpact.mergedCount,
                newName: trimmedRenameValue,
              })
            : t('exercise.bulk_rename.confirm.body', {
                renamedCount: renameImpact.renamedCount,
                newName: trimmedRenameValue,
              })
        }
        onCancel={() => setRenameConfirmOpen(false)}
        onOk={handleBulkRename}
        okText={t('exercise.bulk_rename.button')}
      />
    </View>
  );
}
