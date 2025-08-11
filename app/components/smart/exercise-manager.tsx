import { spacing } from '@/hooks/useAppTheme';
import { T, useTranslate } from '@tolgee/react';
import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useDebouncedCallback } from 'use-debounce';
import {
  Card,
  Chip,
  IconButton,
  List,
  Searchbar,
  Text,
  TextInput,
} from 'react-native-paper';
import { AccordionItem } from '@/components/presentation/accordion-item';
import { useScroll } from '@/hooks/useScollListener';
import { FlashList, useRecyclingState } from '@shopify/flash-list';
import {
  ExerciseDescriptor,
  selectExerciseById,
  selectExercises,
  selectMuscles,
  updateExercise,
} from '@/store/stored-sessions';
import { useAppSelector, useAppSelectorWithArg } from '@/store';
import { useDispatch } from 'react-redux';

function SearchAndFilters({
  searchText,
  setSearchText,
  muscleFilters,
  setMuscleFilters,
}: {
  searchText: string;
  setSearchText: (text: string) => void;
  muscleFilters: string[];
  setMuscleFilters: (muscles: string[]) => void;
}) {
  const { t } = useTranslate();
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const selectedFiltersSubtitle =
    muscleFilters.join(', ') || 'No filters applied';

  return (
    <View style={{ gap: spacing[2] }}>
      <Searchbar
        placeholder={t('Search')}
        value={searchText}
        onChangeText={setSearchText}
        autoCorrect={false}
        style={{ marginHorizontal: spacing.pageHorizontalMargin }}
      />

      <Card
        mode="contained"
        style={{ marginHorizontal: spacing.pageHorizontalMargin }}
      >
        <Card.Title
          title={t('Filters')}
          subtitle={selectedFiltersSubtitle}
          right={() => (
            <IconButton
              icon={filtersExpanded ? 'expandCircleUp' : 'expandCircleDown'}
              animated
              mode="contained-tonal"
              onPress={() => {
                setFiltersExpanded(!filtersExpanded);
              }}
            />
          )}
        />
        <Card.Content>
          <AccordionItem isExpanded={filtersExpanded}>
            <MuscleSelector
              muscles={muscleFilters}
              onChange={setMuscleFilters}
            />
          </AccordionItem>
        </Card.Content>
      </Card>
    </View>
  );
}

function MuscleSelector(props: {
  muscles: string[];
  onChange: (muscles: string[]) => void;
}) {
  const { muscles, onChange } = props;
  const muscleList = useAppSelector(selectMuscles);
  return (
    <View style={{ gap: spacing[2] }}>
      <Text variant="labelLarge">
        <T keyName="Muscle" />
      </Text>
      <View
        style={{
          flexDirection: 'row',
          gap: spacing[1],
          flexWrap: 'wrap',
        }}
      >
        {muscleList.map((x) => (
          <Chip
            mode="outlined"
            key={x}
            onPress={() => {
              onChange(
                muscles.includes(x)
                  ? muscles.filter((musc) => musc !== x)
                  : muscles.concat([x]),
              );
            }}
            showSelectedOverlay
            selected={muscles.includes(x)}
          >
            {x}
          </Chip>
        ))}
      </View>
    </View>
  );
}

function ExerciseListItem({ exerciseId }: { exerciseId: string }) {
  const exercise = useAppSelectorWithArg(selectExerciseById, exerciseId);
  const [expanded, setExpanded] = useRecyclingState(false, [exerciseId]);
  const [listExpanded, setListExpanded] = useRecyclingState(false, [
    exerciseId,
  ]);

  return (
    <List.Accordion
      title={exercise.name}
      description={exercise.muscles.join(', ')}
      expanded={listExpanded}
      onPress={() => {
        if (!expanded) {
          setListExpanded(true);
          setExpanded(true);
        } else {
          setExpanded(false);
        }
      }}
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
  );
}

export default function ExerciseManager() {
  const [searchText, setSearchText] = useState('');
  const exercises = useAppSelector(selectExercises);
  const exerciseEntries = useMemo(() => Object.entries(exercises), [exercises]);
  const [muscleFilters, setMuscleFilters] = useState([] as string[]);

  const [filteredExercises, setFilteredExercises] = useState(exerciseEntries);
  const search = useDebouncedCallback(() => {
    const regex = new RegExp(searchText, 'i');
    const newFilteredExercises = Object.entries(exercises).filter(
      (x) =>
        (!muscleFilters.length ||
          x[1].muscles.some((exerciseMuscle) =>
            muscleFilters.includes(exerciseMuscle),
          )) &&
        regex.test(x[1].name),
    );
    setFilteredExercises(newFilteredExercises);
  }, 100);

  useEffect(() => {
    search();
  }, [search, searchText, muscleFilters]);

  const flatListItems = useMemo(
    () => [null!, ...filteredExercises],
    [filteredExercises],
  );
  const { handleScroll } = useScroll();

  return (
    <FlashList
      onScroll={handleScroll}
      style={{ flex: 1 }}
      data={flatListItems}
      getItemType={(_, index) => (index === 0 ? 'filters' : 'exercise')}
      keyExtractor={(item, index) => (index === 0 ? 'filters' : item[0])}
      renderItem={({ item, index }) => {
        if (index === 0) {
          return (
            <SearchAndFilters
              searchText={searchText}
              setSearchText={setSearchText}
              muscleFilters={muscleFilters}
              setMuscleFilters={setMuscleFilters}
            />
          );
        }
        return <ExerciseListItem exerciseId={item[0]} />;
      }}
    />
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
      />
      <TextInput
        label={t('Instructions')}
        value={exercise.instructions}
        onChangeText={(instructions) => update({ instructions })}
        multiline
      />
      <MuscleSelector
        muscles={exercise.muscles}
        onChange={(muscles) => update({ muscles })}
      />
    </View>
  );
}
