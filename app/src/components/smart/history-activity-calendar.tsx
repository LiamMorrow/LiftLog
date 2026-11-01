import {
  ActivityCalendar,
  ActivityMonthRows,
  activityMonthRowsHeight,
} from '@/components/presentation/calendar/activity-calendar';
import { ActivityLegend } from '@/components/presentation/calendar/activity-legend';
import { useTranslate } from '@tolgee/react';
import { NativeIconButton } from '@/components/presentation/foundation/native-icon-button';
import ChevronLeftIcon from '@expo/material-symbols/chevron_left.xml';
import ChevronRightIcon from '@expo/material-symbols/chevron_right.xml';
import { InfinitePager } from '@/components/presentation/foundation/infinite-pager';
import { AppText } from '@/components/presentation/foundation/app-text';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { useFormatDate } from '@/hooks/useFormatDate';
import { useToday } from '@/hooks/useToday';
import { useAppSelector, useAppSelectorWhenFocusedWithArg } from '@/store';
import { useOwnHistory } from '@/components/smart/own-history-provider';
import { ActivityCell, selectActivityMonth, weeksInMonth } from '@/store/activity';
import { LocalDate, Year, YearMonth } from '@js-joda/core';
import { useCallback, useMemo } from 'react';
import { I18nManager, View } from 'react-native';

const PAGED_MONTHS = 100 * 12;
const MONTH_PADDING = spacing[2];
const monthIndexOf = (yearMonth: YearMonth) => yearMonth.year() * 12 + yearMonth.monthValue() - 1;
const yearMonthAt = (monthIndex: number) => YearMonth.of(Math.floor(monthIndex / 12), (monthIndex % 12) + 1);

interface HistoryActivityCalendarProps {
  currentYearMonth: YearMonth;
  selectedDate: LocalDate | undefined;
  onMonthChange: (yearMonth: YearMonth) => void;
  onDateToggle: (date: LocalDate) => void;
}

export function HistoryActivityCalendar({
  currentYearMonth,
  selectedDate,
  onMonthChange,
  onDateToggle,
}: HistoryActivityCalendarProps) {
  const { t } = useTranslate();
  const { colors } = useAppTheme();
  const formatDate = useFormatDate();
  const today = useToday();
  const firstDayOfWeek = useAppSelector((x) => x.settings.firstDayOfWeek);

  const firstOfMonth = currentYearMonth.atDay(1);
  const isCurrentMonth = currentYearMonth.equals(YearMonth.now());

  // Stable, so the memoized day cells survive a re-render of the screen around them.
  const handleCellPress = useCallback((cell: ActivityCell) => onDateToggle(cell.date), [onDateToggle]);

  const header = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2], height: 48 }}>
      <AppText variant="titleLarge" testID="calendar-month" style={{ flex: 1 }}>
        {formatDate(firstOfMonth, {
          month: 'long',
          year: currentYearMonth.year() === Year.now().value() ? undefined : 'numeric',
        })}
      </AppText>
      <View style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row', gap: spacing[2] }}>
        <NativeIconButton
          testID="calendar-nav-previous-month"
          icon={ChevronLeftIcon}
          systemImage="chevron.left"
          variant="filled"
          colors={{ container: colors.surfaceVariant, content: colors.primary }}
          mirrored
          label={t('generic.previous.button')}
          onPress={() => onMonthChange(currentYearMonth.minusMonths(1))}
        />
        <NativeIconButton
          testID="calendar-nav-next-month"
          icon={ChevronRightIcon}
          systemImage="chevron.right"
          variant="filled"
          colors={{ container: colors.surfaceVariant, content: colors.primary }}
          mirrored
          label={t('generic.next.button')}
          onPress={() => onMonthChange(currentYearMonth.plusMonths(1))}
          disabled={isCurrentMonth}
        />
      </View>
    </View>
  );

  return (
    <ActivityCalendar
      density="month"
      firstDayOfWeek={firstDayOfWeek}
      header={header}
      footer={<ActivityLegend />}
      monthBody={
        <InfinitePager
          page={monthIndexOf(currentYearMonth)}
          minPage={monthIndexOf(YearMonth.from(today)) - PAGED_MONTHS}
          maxPage={monthIndexOf(YearMonth.from(today))}
          onPageChange={(monthIndex) => onMonthChange(yearMonthAt(monthIndex))}
          getPageHeight={(monthIndex) =>
            activityMonthRowsHeight(weeksInMonth(yearMonthAt(monthIndex), firstDayOfWeek)) + 2 * MONTH_PADDING
          }
          renderPage={(monthIndex) => (
            <HistoryMonth monthIndex={monthIndex} selectedDate={selectedDate} onCellPress={handleCellPress} />
          )}
          style={{ marginHorizontal: -spacing.pageHorizontalMargin, marginVertical: -MONTH_PADDING }}
        />
      }
    />
  );
}

interface HistoryMonthProps {
  monthIndex: number;
  selectedDate: LocalDate | undefined;
  onCellPress: (cell: ActivityCell) => void;
}

function HistoryMonth({ monthIndex, selectedDate, onCellPress }: HistoryMonthProps) {
  const today = useToday();
  const own = useOwnHistory();
  const params = useMemo(() => ({ yearMonth: yearMonthAt(monthIndex), today, own }), [monthIndex, today, own]);
  const rows = useAppSelectorWhenFocusedWithArg(selectActivityMonth, params);

  return (
    <View style={{ paddingHorizontal: spacing.pageHorizontalMargin, paddingVertical: MONTH_PADDING }}>
      <ActivityMonthRows rows={rows} selectedDate={selectedDate} onCellPress={onCellPress} />
    </View>
  );
}
