import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { spacing } from '@/hooks/useAppTheme';
import { useFormatDate } from '@/hooks/useFormatDate';
import { ActivityCell, ActivityRow } from '@/store/activity';
import { getDateOnDay } from '@/utils/format-date';
import { DayOfWeek, LocalDate } from '@js-joda/core';
import { ReactNode } from 'react';
import { I18nManager, View, ViewStyle } from 'react-native';
import { ActivityDayCell } from '@/components/presentation/calendar/activity-day-cell';
import { ActivityWeekCell } from '@/components/presentation/calendar/activity-week-cell';

/** Keeps every row's cells aligned under one another regardless of how long the names are. */
const LABEL_WIDTH = 64;
const TRAILING_WIDTH = 72;

export type ActivityDensity = 'month' | 'week';

interface ActivityCalendarProps {
  density: ActivityDensity;
  rows: ActivityRow[];
  /** Only the month grid needs it; a week row is a rolling window, so its columns are named by their own dates. */
  firstDayOfWeek?: DayOfWeek;
  selectedDate?: LocalDate;
  header?: ReactNode;
  footer?: ReactNode;
  onCellPress?: (cell: ActivityCell) => void;
  renderRowTrailing?: (row: ActivityRow) => ReactNode;
}

export function ActivityCalendar({
  density,
  rows,
  firstDayOfWeek,
  selectedDate,
  header,
  footer,
  onCellPress,
  renderRowTrailing,
}: ActivityCalendarProps) {
  const formatDate = useFormatDate();

  const isWeek = density === 'week';

  // A week row ends on today rather than on the last day of the week, so naming its columns from
  // `firstDayOfWeek` would slide the letters off the days they sit above.
  const headerDates = isWeek
    ? (rows[0]?.cells ?? []).map((cell) => cell.date)
    : Array.from({ length: 7 }, (_, offset) =>
        getDateOnDay(DayOfWeek.of((((firstDayOfWeek ?? DayOfWeek.MONDAY).ordinal() + offset) % 7) + 1)),
      );

  return (
    <View style={{ alignItems: 'stretch', gap: spacing[1] }}>
      {header}

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[1] }}>
        {isWeek && <View style={{ width: LABEL_WIDTH }} />}
        <ForceLTRRow style={{ flex: 1, gap: spacing[1] }}>
          {headerDates.map((date, index) => (
            <SurfaceText
              key={index}
              font="text-xs"
              color="onSurfaceVariant"
              style={{ flex: 1, textAlign: 'center', letterSpacing: 0.6 }}
            >
              {formatDate(date, { weekday: 'narrow' }).toUpperCase()}
            </SurfaceText>
          ))}
        </ForceLTRRow>
        {isWeek && renderRowTrailing && <View style={{ width: TRAILING_WIDTH }} />}
      </View>

      {rows.map((row) => {
        const cells = (
          <ForceLTRRow style={{ flex: 1, gap: spacing[1] }}>
            {row.cells.map((cell, columnIndex) =>
              // Position, not date: keying by date would remount all 42 cells on every month change.
              isWeek ? (
                <ActivityWeekCell key={columnIndex} cell={cell} />
              ) : (
                <ActivityDayCell
                  key={columnIndex}
                  cell={cell}
                  isSelected={!!selectedDate?.isEqual(cell.date)}
                  onPress={onCellPress}
                />
              ),
            )}
          </ForceLTRRow>
        );

        if (isWeek) {
          return (
            <View key={row.key} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[1] }}>
              <SurfaceText font="text-sm" weight="bold" numberOfLines={1} style={{ width: LABEL_WIDTH }}>
                {row.label}
              </SurfaceText>
              {cells}
              {renderRowTrailing && (
                <View style={{ width: TRAILING_WIDTH }}>
                  <SurfaceText font="text-xs" color="onSurfaceVariant" numberOfLines={1}>
                    {renderRowTrailing(row)}
                  </SurfaceText>
                </View>
              )}
            </View>
          );
        }

        return (
          <View key={row.key} style={{ gap: spacing[1] }}>
            {cells}
          </View>
        );
      })}

      {footer}
    </View>
  );
}

function ForceLTRRow({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }, style]}>{children}</View>;
}
