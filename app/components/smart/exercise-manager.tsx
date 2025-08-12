import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { useTranslate } from '@tolgee/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, View } from 'react-native';
import { useDebouncedCallback } from 'use-debounce';
import {
  AnimatedFAB,
  Icon,
  List,
  TextInput,
  TouchableRipple,
} from 'react-native-paper';
import { AccordionItem } from '@/components/presentation/accordion-item';
import { useScroll } from '@/hooks/useScollListener';
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
import Enumerable from 'linq';
import ExerciseSearchAndFilters from '@/components/presentation/exercise-search-and-filters';
import ExerciseMuscleSelector from '@/components/presentation/exercise-muscle-selector';

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
        description={exercise.muscles.join(', ')}
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
  const [searchText, setSearchText] = useState('');
  const exercises = useAppSelector(selectExercises);
  const filteredExerciseIds = useAppSelector(
    (s) => s.storedSessions.filteredExerciseIds,
  );
  const setFilteredExerciseIds = (ids: string[]) => {
    dispatch(setFilteredExerciseIdsAction(ids));
  };
  const [muscleFilters, setMuscleFilters] = useState([] as string[]);

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
    setSearchText('New exercise');
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
        text: t('{name} deleted', { name: exercise.name }),
        action: t('Undo'),
        dispatchAction: [
          updateExercise({ id, exercise }),
          setFilteredExerciseIdsAction(filteredExerciseIds),
        ],
      }),
    );
  };

  const search = useDebouncedCallback(() => {
    const searchRegex = new RegExp(searchText, 'i');
    const matchRegex = new RegExp('^' + searchText + '$', 'i');
    const newFilteredExercises = Enumerable.from(Object.entries(exercises))
      .where(
        (x) =>
          (!muscleFilters.length ||
            x[1].muscles.some((exerciseMuscle) =>
              muscleFilters.includes(exerciseMuscle),
            )) &&
          searchRegex.test(x[1].name),
      )
      .orderByDescending((x) => matchRegex.test(x[1].name))
      .select((x) => x[0])
      .toArray();
    setFilteredExerciseIds(newFilteredExercises);
  }, 100);

  const flatListItems = useMemo(
    () => [null!, ...filteredExerciseIds],
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
              <ExerciseSearchAndFilters
                searchText={searchText}
                setSearchText={(s) => {
                  setSearchText(s);
                  search();
                }}
                muscleFilters={muscleFilters}
                setMuscleFilters={(m) => {
                  setMuscleFilters(m);
                  search();
                }}
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
        label={t('Add exercise')}
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
        label={t('Exercise name')}
        value={exercise.name}
        onChangeText={(name) => update({ name })}
        testID="exercise-name-input"
      />
      <TextInput
        label={t('Instructions')}
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
