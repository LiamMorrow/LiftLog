import { SegmentedList } from '@/components/presentation/foundation/segmented-list';
import { WeightedExerciseStatSummary } from '@/components/presentation/stats/weighted-exercise-stat-summary';
import { spacing } from '@/hooks/useAppTheme';
import {
  GranularStatisticView,
  WeightedExerciseStatistics,
} from '@/store/stats';
import { useTranslate, T } from '@tolgee/react';
import { useState } from 'react';
import { View } from 'react-native';
import { Searchbar, Text } from 'react-native-paper';

export function WeightedExerciseListSearcher({
  stats: { weightedExerciseStats },
  onItemPress,
}: {
  stats: GranularStatisticView;
  onItemPress: (item: WeightedExerciseStatistics) => void;
}) {
  const [searchText, setSearchText] = useState('');
  const { t } = useTranslate();
  const [filteredExercises, setFilteredExercises] = useState(
    weightedExerciseStats,
  );
  const handleChangeText = (value: string) => {
    setSearchText(value);
    setFilteredExercises(
      weightedExerciseStats.filter((x) =>
        x.exerciseName.toLocaleLowerCase().includes(value.toLocaleLowerCase()),
      ),
    );
  };
  return (
    <View
      style={{
        paddingHorizontal: spacing.pageHorizontalMargin,
        gap: spacing[2],
      }}
    >
      <Searchbar
        mode="bar"
        placeholder={t('generic.search.button')}
        value={searchText}
        onChangeText={handleChangeText}
      />
      {!filteredExercises.length && (
        <Text>
          <T keyName="stats.no_data.message" />
        </Text>
      )}
      <SegmentedList
        scrollable
        items={filteredExercises}
        onItemPress={onItemPress}
        renderItem={(item) => (
          <WeightedExerciseStatSummary exerciseStats={item} />
        )}
      />
    </View>
  );
}
