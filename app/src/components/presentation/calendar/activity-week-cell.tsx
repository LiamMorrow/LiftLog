import { useAppTheme } from '@/hooks/useAppTheme';
import { ActivityCell } from '@/store/activity';
import { memo } from 'react';
import { View } from 'react-native';
import { levelColor } from '@/components/presentation/calendar/activity-colors';

interface ActivityWeekCellProps {
  cell: ActivityCell;
}

/**
 * The week strip answers "did anyone train?" at a glance, so the cells carry no day number -- the weekday
 * letters above the row are the only label a seven-day window needs.
 */
export const ActivityWeekCell = memo(function ActivityWeekCell({ cell }: ActivityWeekCellProps) {
  const { colors } = useAppTheme();
  const { background } = levelColor(cell.level, colors);

  return (
    <View
      style={{
        flex: 1,
        height: 32,
        borderRadius: 10,
        backgroundColor: cell.level === 0 ? colors.surfaceContainer : background,
      }}
    />
  );
});
