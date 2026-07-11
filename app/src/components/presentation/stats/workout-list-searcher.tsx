import { SegmentedList } from '@/components/presentation/foundation/segmented-list';
import { WorkoutStatSummary } from '@/components/presentation/stats/workout-stat-summary';
import { spacing } from '@/hooks/useAppTheme';
import { GranularStatisticView, WorkoutExerciseStatistics } from '@/store/stats';
import { useTranslate, T } from '@tolgee/react';
import { useState } from 'react';
import { View } from 'react-native';
import { Searchbar, Text } from 'react-native-paper';

export function WorkoutListSearcher({
  stats: { workoutExerciseStats },
  onItemPress,
}: {
  stats: GranularStatisticView;
  onItemPress: (item: WorkoutExerciseStatistics) => void;
}) {
  const [searchText, setSearchText] = useState('');
  const { t } = useTranslate();
  const [filteredWorkouts, setFilteredWorkouts] = useState(workoutExerciseStats);
  const handleChangeText = (value: string) => {
    setSearchText(value);
    setFilteredWorkouts(
      workoutExerciseStats.filter((x) => x.workoutName.toLocaleLowerCase().includes(value.toLocaleLowerCase())),
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
      {!filteredWorkouts.length && (
        <Text>
          <T keyName="stats.no_data.message" />
        </Text>
      )}
      <SegmentedList
        scrollable
        items={filteredWorkouts}
        renderItem={(item) => <WorkoutStatSummary onPress={onItemPress} workoutStats={item} />}
      />
    </View>
  );
}
