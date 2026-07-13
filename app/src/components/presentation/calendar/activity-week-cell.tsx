import { rounding, useAppTheme } from '@/hooks/useAppTheme';
import { ActivityCell } from '@/store/activity';
import { memo } from 'react';
import { Animated, View } from 'react-native';
import { levelColor } from '@/components/presentation/calendar/activity-colors';
import { CellEntrance } from '@/components/presentation/calendar/activity-entrance';

interface ActivityWeekCellProps {
  cell: ActivityCell;
  entrance: CellEntrance;
}

/**
 * The week strip answers "did anyone train?" at a glance, so the cells carry no day number -- the weekday
 * letters above the row are the only label a seven-day window needs.
 */
export const ActivityWeekCell = memo(function ActivityWeekCell({ cell, entrance }: ActivityWeekCellProps) {
  const { colors } = useAppTheme();
  const { background } = levelColor(cell.level, colors);

  return (
    <Animated.View
      style={{
        flex: 1,
        aspectRatio: 1,
        opacity: entrance.opacity,
        transform: [{ scale: entrance.scale }],
      }}
    >
      <View
        style={{
          flex: 1,
          borderRadius: rounding.segmentedBetweenRadius * 3,
          // A rest day must never read as *heavier* than a light training day, so the empty track sits
          // below the faintest step of the ramp rather than above it.
          backgroundColor: cell.level === 0 ? colors.surface : background,
          borderColor: cell.isToday ? colors.primary : 'transparent',
          borderWidth: cell.isToday ? 2 : 0,
        }}
      />
    </Animated.View>
  );
});
