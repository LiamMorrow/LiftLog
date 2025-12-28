import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { useTranslate } from '@tolgee/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, View } from 'react-native';
import { AnimatedFAB, Icon, List, TextInput } from 'react-native-paper';
import TouchableRipple from '@/components/presentation/gesture-wrappers/touchable-ripple';
import { AccordionItem } from '@/components/presentation/accordion-item';
import { useScroll } from '@/hooks/useScrollListener';
import { FlashList, useRecyclingState } from '@shopify/flash-list';
import {
  deleteExercise as deleteExerciseAction,
  ExerciseDescriptor,
  selectExerciseById,
  selectExercises,
  setFilteredExerciseIds as setFilteredExerciseIdsAction,
  updateExercise,
} from '@/store/stored-sessions';
import { useAppSelector, useAppSelectorWithArg } from '@/store';
import { useDispatch } from 'react-redux';
import { uuid } from '@/utils/uuid';
import { SwipeRow } from 'react-native-swipe-list-view';
import { showSnackbar } from '@/store/app';
import { useMountEffect } from '@/hooks/useMountEffect';
import ExerciseMuscleSelector from '@/components/presentation/exercise-muscle-selector';
import ExerciseFilterer from '@/components/presentation/exercise-filterer';

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
  const [expanded, setExpanded] = useRecyclingState(expand, [
    exerciseId,
    expand,
  ]);
  const [listExpanded, setListExpanded] = useRecyclingState(expand, [
    exerciseId,
    expand,
  ]);

  const rowRef = useRef<SwipeRow<unknown>>(null);
  useEffect(() => {
    rowRef.current?.closeRowWithoutAnimation();
  }, [exerciseId]);

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
    const exercise = exercises[id];
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
      <FlashList
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
  const update = (ex: Partial<ExerciseDescriptor>) => {
    dispatch(
      updateExercise({ exercise: { ...exercise, ...ex }, id: exerciseId }),
    );
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
    </View>
  );
}
