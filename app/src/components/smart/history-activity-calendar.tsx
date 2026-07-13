import { ActivityCalendar } from '@/components/presentation/calendar/activity-calendar';
import IconButton from '@/components/presentation/foundation/gesture-wrappers/icon-button';
import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { spacing } from '@/hooks/useAppTheme';
import { useFormatDate } from '@/hooks/useFormatDate';
import { useToday } from '@/hooks/useToday';
import { useAppSelector, useAppSelectorWithArg } from '@/store';
import { ActivityCell, selectActivityMonth } from '@/store/activity';
import { LocalDate, Year, YearMonth } from '@js-joda/core';
import { useTranslate } from '@tolgee/react';
import { useMemo } from 'react';
import { I18nManager, View } from 'react-native';
import { Card } from 'react-native-paper';

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
  const { t } = useTranslate();
  const formatDate = useFormatDate();
  const today = useToday();
  const firstDayOfWeek = useAppSelector((x) => x.settings.firstDayOfWeek);

  const params = useMemo(() => ({ yearMonth: currentYearMonth, today }), [currentYearMonth, today]);
  const { rows, crossesFeedHorizon } = useAppSelectorWithArg(selectActivityMonth, params);

  const firstOfMonth = currentYearMonth.atDay(1);
  const isCurrentMonth = currentYearMonth.equals(YearMonth.now());

  const handleCellPress = (cell: ActivityCell) => {
    // Selecting a day filters the list below. Tapping the selected day again clears the filter.
    onDateSelect(selectedDate?.isEqual(cell.date) ? undefined : cell.date);
  };

  const header = (
    <View style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row', alignItems: 'center' }}>
      <View style={{ flex: 1 }}>
        <IconButton
          testID="calendar-nav-previous-month"
          icon="chevronLeft"
          onPress={() => onMonthChange(currentYearMonth.minusMonths(1))}
        />
      </View>
      <View style={{ flex: 5, justifyContent: 'center', alignItems: 'center' }}>
        <SurfaceText testID="calendar-month">
          {formatDate(firstOfMonth, {
            month: 'long',
            year: currentYearMonth.year() === Year.now().value() ? undefined : 'numeric',
          })}
        </SurfaceText>
      </View>
      <View style={{ flex: 1 }}>
        <IconButton
          testID="calendar-nav-next-month"
          icon="chevronRight"
          onPress={() => onMonthChange(currentYearMonth.plusMonths(1))}
          disabled={isCurrentMonth}
        />
      </View>
    </View>
  );

  const footer = crossesFeedHorizon ? (
    <SurfaceText font="text-xs" color="onSurfaceVariant" style={{ marginTop: spacing[2], textAlign: 'center' }}>
      {t('history.calendar.feed_horizon.message')}
    </SurfaceText>
  ) : undefined;

  return (
    <Card mode="contained">
      <Card.Content>
        <ActivityCalendar
          density="month"
          rows={rows}
          firstDayOfWeek={firstDayOfWeek}
          selectedDate={selectedDate}
          header={header}
          footer={footer}
          onCellPress={handleCellPress}
        />
      </Card.Content>
    </Card>
  );
}
