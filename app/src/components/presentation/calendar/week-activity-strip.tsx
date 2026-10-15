import { ActivityWeekCell } from '@/components/presentation/calendar/activity-week-cell';
import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { spacing } from '@/hooks/useAppTheme';
import { useFormatDate } from '@/hooks/useFormatDate';
import { ActivityCell } from '@/store/activity';
import { I18nManager, View } from 'react-native';

interface WeekActivityStripProps {
  cells: ActivityCell[];
}

/**
 * The seven-day row `ActivityCalendar` draws in `week` density, minus the name and trailing columns it aligns
 * every row against. Here the row belongs to a single person already named above it, so those columns would
 * only eat the width the cells need.
 */
export function WeekActivityStrip({ cells }: WeekActivityStripProps) {
  const formatDate = useFormatDate();

  const direction = I18nManager.isRTL ? 'row-reverse' : 'row';

  return (
    <View style={{ gap: spacing[1] }}>
      <View style={{ flexDirection: direction, gap: spacing[1] }}>
        {cells.map((cell, index) => (
          <SurfaceText
            key={index}
            font="text-2xs"
            color="onSurfaceVariant"
            style={{ flex: 1, textAlign: 'center', letterSpacing: 0.6 }}
          >
            {formatDate(cell.date, { weekday: 'narrow' }).toUpperCase()}
          </SurfaceText>
        ))}
      </View>

      <View style={{ flexDirection: direction, gap: spacing[1] }}>
        {cells.map((cell, index) => (
          <ActivityWeekCell key={index} cell={cell} />
        ))}
      </View>
    </View>
  );
}
