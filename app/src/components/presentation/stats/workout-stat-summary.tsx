import Icon from '@/components/presentation/foundation/gesture-wrappers/icon';
import TouchableRipple from '@/components/presentation/foundation/gesture-wrappers/touchable-ripple';
import { spacing } from '@/hooks/useAppTheme';
import { WorkoutExerciseStatistics } from '@/store/stats';
import { useTranslate } from '@tolgee/react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

export function WorkoutStatSummary({
  workoutStats,
  onPress,
}: {
  workoutStats: WorkoutExerciseStatistics;
  onPress: (item: WorkoutExerciseStatistics) => void;
}) {
  const { t } = useTranslate();
  return (
    <TouchableRipple onPress={() => onPress(workoutStats)}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: spacing[4],
          gap: spacing[2],
        }}
      >
        <View style={{ flex: 1 }}>
          <Text variant="bodyMedium">{workoutStats.workoutName}</Text>
          <Text variant="bodySmall">
            {t('stats.workout_list.exercise_count.label', {
              count: workoutStats.exerciseStats.length,
            })}
          </Text>
        </View>
        <Icon source="chevronRight" size={24} />
      </View>
    </TouchableRipple>
  );
}
