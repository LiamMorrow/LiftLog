import { spacing } from '@/hooks/useAppTheme';
import { useTranslate } from '@tolgee/react';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import exercises from '../../assets/exercises.json';
import { useDebouncedCallback } from 'use-debounce';
import { Card, Chip, IconButton, List, Searchbar } from 'react-native-paper';
import Enumerable from 'linq';
import { useSharedValue } from 'react-native-reanimated';
import { AccordionItem } from '@/components/presentation/accordion-item';

const muscles = Enumerable.from(exercises.exercises)
  .selectMany((x) => [...x.primaryMuscles, ...x.secondaryMuscles])
  .distinct()
  .toArray();

export default function ExercisePicker() {
  const [searchText, setSearchText] = useState('');
  const { t } = useTranslate();
  const [filteredExercises, setFilteredExercises] = useState(
    exercises.exercises,
  );
  const [muscleFilters, setMuscleFilters] = useState([] as string[]);
  const filtersExpandedShared = useSharedValue(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const search = useDebouncedCallback(() => {
    const regex = new RegExp(searchText, 'i');
    const newFilteredExercises = exercises.exercises.filter(
      (x) =>
        (!muscleFilters.length ||
          x.primaryMuscles
            .concat(x.secondaryMuscles)
            .some((exerciseMuscle) =>
              muscleFilters.includes(exerciseMuscle),
            )) &&
        regex.test(x.name),
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

  const selectedFiltersSubtitle =
    muscleFilters.join(', ') || 'No filters applied';
  return (
    <View style={{ flex: 1, gap: spacing[2] }}>
      <FlatList
        data={flatListItems}
        keyExtractor={(e) => e?.name ?? ''}
        renderItem={({ item, index }) => {
          if (index === 0) {
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
                        icon={
                          filtersExpanded
                            ? 'expandCircleUp'
                            : 'expandCircleDown'
                        }
                        animated
                        mode="contained-tonal"
                        onPress={() => {
                          filtersExpandedShared.set(!filtersExpanded);
                          setFiltersExpanded(!filtersExpanded);
                        }}
                      />
                    )}
                  />
                  <Card.Content>
                    <AccordionItem isExpanded={filtersExpandedShared}>
                      <View
                        style={{
                          flexDirection: 'row',
                          gap: spacing[1],
                          flexWrap: 'wrap',
                        }}
                      >
                        {muscles.map((x) => (
                          <Chip
                            mode="outlined"
                            key={x}
                            onPress={() => {
                              setMuscleFilters((cur) =>
                                cur.includes(x)
                                  ? cur.filter((musc) => musc !== x)
                                  : cur.concat([x]),
                              );
                            }}
                            showSelectedOverlay
                            selected={muscleFilters.includes(x)}
                          >
                            {x}
                          </Chip>
                        ))}
                      </View>
                    </AccordionItem>
                  </Card.Content>
                </Card>
              </View>
            );
          }
          return (
            <List.Item
              title={item.name}
              description={[
                ...item.primaryMuscles,
                ...item.secondaryMuscles,
              ].join(', ')}
            />
          );
        }}
      />
    </View>
  );
}
