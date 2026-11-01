import { Icon } from '@/components/presentation/foundation/icon';
import TouchableRipple from '@/components/presentation/foundation/touchable-ripple';
import { spacing } from '@/hooks/useAppTheme';
import { WeightedExerciseStatistics } from '@/store/stats';
import { View } from 'react-native';
import { AppText } from '@/components/presentation/foundation/app-text';

export function WeightedExerciseStatSummary({
  exerciseStats,
  onPress,
}: {
  exerciseStats: WeightedExerciseStatistics;
  onPress: (item: WeightedExerciseStatistics) => void;
}) {
  return (
    <TouchableRipple onPress={() => onPress(exerciseStats)}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: spacing[4],
          gap: spacing[2],
        }}
      >
        <View style={{ flex: 1 }}>
          <AppText variant="bodyMedium">{exerciseStats.exerciseName}</AppText>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <AppText variant="bodySmall">
              Total lifted: {exerciseStats.totalVolumeStatistics.totalValue.shortLocaleFormat(0)}
            </AppText>
            <AppText variant="bodySmall">
              1RM: {exerciseStats.max1RMPerSessionStatistics.currentValue.shortLocaleFormat(0)}
            </AppText>
          </View>
        </View>
        <Icon source="chevronRight" size={24} />
      </View>
    </TouchableRipple>
  );
}
