import Icon from '@/components/presentation/foundation/gesture-wrappers/icon';
import { spacing } from '@/hooks/useAppTheme';
import { WeightedExerciseStatistics } from '@/store/stats';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

export function WeightedExerciseStatSummary({
  exerciseStats,
}: {
  exerciseStats: WeightedExerciseStatistics;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
      }}
    >
      <View style={{ flex: 1 }}>
        <Text variant="bodyMedium">{exerciseStats.exerciseName}</Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <Text variant="bodySmall">
            Total lifted:{' '}
            {exerciseStats.totalVolumeStatistics.totalValue.shortLocaleFormat(
              0,
            )}
          </Text>
          <Text variant="bodySmall">
            1RM: {exerciseStats.oneRepMax.shortLocaleFormat(0)}
          </Text>
        </View>
      </View>
      <Icon source="chevronRight" size={24} />
    </View>
  );
}
