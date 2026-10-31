import { SegmentedList } from '@/components/presentation/foundation/segmented-list';
import { WeightedExerciseStatSummary } from '@/components/presentation/stats/weighted-exercise-stat-summary';
import { spacing } from '@/hooks/useAppTheme';
import { GranularStatisticView, WeightedExerciseStatistics } from '@/store/stats';
import { T } from '@tolgee/react';
import { useState } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { SearchField } from '@/components/presentation/foundation/search-field';

export function WeightedExerciseListSearcher({
  stats: { weightedExerciseStats },
  onItemPress,
}: {
  stats: GranularStatisticView;
  onItemPress: (item: WeightedExerciseStatistics) => void;
}) {
  const [searchText, setSearchText] = useState('');
  const [filteredExercises, setFilteredExercises] = useState(weightedExerciseStats);
  const handleChangeText = (value: string) => {
    setSearchText(value);
    setFilteredExercises(
      weightedExerciseStats.filter((x) => x.exerciseName.toLocaleLowerCase().includes(value.toLocaleLowerCase())),
    );
  };
  return (
    <View
      style={{
        paddingHorizontal: spacing.pageHorizontalMargin,
        gap: spacing[2],
        flex: 1,
      }}
    >
      <SearchField value={searchText} onChangeText={handleChangeText} />
      {!filteredExercises.length && (
        <Text>
          <T keyName="stats.no_data.message" />
        </Text>
      )}
      <SegmentedList
        scrollable
        items={filteredExercises}
        renderItem={(item) => <WeightedExerciseStatSummary onPress={onItemPress} exerciseStats={item} />}
      />
    </View>
  );
}
