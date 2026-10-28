import { ActivityCalendar } from '@/components/presentation/calendar/activity-calendar';
import { ActivityLegend } from '@/components/presentation/calendar/activity-legend';
import IconButton from '@/components/presentation/foundation/icon-button';
import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { spacing } from '@/hooks/useAppTheme';
import { useFormatDate } from '@/hooks/useFormatDate';
import { useToday } from '@/hooks/useToday';
import { useAppSelector, useAppSelectorWhenFocusedWithArg } from '@/store';
import { useOwnHistory } from '@/components/smart/own-history-provider';
import { ActivityCell, selectActivityMonth } from '@/store/activity';
import { LocalDate, Year, YearMonth } from '@js-joda/core';
import { useCallback, useMemo } from 'react';
import { I18nManager, View } from 'react-native';

interface HistoryActivityCalendarProps {
  currentYearMonth: YearMonth;
  selectedDate: LocalDate | undefined;
  onMonthChange: (yearMonth: YearMonth) => void;
  onDateSelect: (date: LocalDate | undefined) => void;
}

export function HistoryActivityCalendar({
  currentYearMonth,
  selectedDate,
  onMonthChange,
  onDateSelect,
}: HistoryActivityCalendarProps) {
  const formatDate = useFormatDate();
  const today = useToday();
  const firstDayOfWeek = useAppSelector((x) => x.settings.firstDayOfWeek);

  const own = useOwnHistory();
  const params = useMemo(() => ({ yearMonth: currentYearMonth, today, own }), [currentYearMonth, today, own]);
  const rows = useAppSelectorWhenFocusedWithArg(selectActivityMonth, params);

  const firstOfMonth = currentYearMonth.atDay(1);
  const isCurrentMonth = currentYearMonth.equals(YearMonth.now());

  // Stable, so the memoized day cells survive a re-render of the screen around them.
  const handleCellPress = useCallback(
    (cell: ActivityCell) => {
      // Selecting a day filters the list below. Tapping the selected day again clears the filter.
      onDateSelect(selectedDate?.isEqual(cell.date) ? undefined : cell.date);
    },
    [onDateSelect, selectedDate],
  );

  const header = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2], height: 48 }}>
      <SurfaceText testID="calendar-month" font="text-xl" weight="500" style={{ flex: 1 }}>
        {formatDate(firstOfMonth, {
          month: 'long',
          year: currentYearMonth.year() === Year.now().value() ? undefined : 'numeric',
        })}
      </SurfaceText>
      <View style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row', gap: spacing[2] }}>
        <IconButton
          testID="calendar-nav-previous-month"
          icon="chevronLeft"
          mode="contained"
          style={{ margin: 0 }}
          onPress={() => onMonthChange(currentYearMonth.minusMonths(1))}
        />
        <IconButton
          testID="calendar-nav-next-month"
          icon="chevronRight"
          mode="contained"
          style={{ margin: 0 }}
          onPress={() => onMonthChange(currentYearMonth.plusMonths(1))}
          disabled={isCurrentMonth}
        />
      </View>
    </View>
  );

  return (
    <ActivityCalendar
      density="month"
      rows={rows}
      firstDayOfWeek={firstDayOfWeek}
      selectedDate={selectedDate}
      header={header}
      footer={<ActivityLegend />}
      onCellPress={handleCellPress}
    />
  );
}
