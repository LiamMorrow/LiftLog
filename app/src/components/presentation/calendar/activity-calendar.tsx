import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { spacing } from '@/hooks/useAppTheme';
import { useFormatDate } from '@/hooks/useFormatDate';
import { useMountEffect } from '@/hooks/useMountEffect';
import { ActivityCell, ActivityRow } from '@/store/activity';
import { getDateOnDay } from '@/utils/format-date';
import { DayOfWeek, LocalDate } from '@js-joda/core';
import { ReactNode, useMemo, useRef } from 'react';
import { Animated, Easing, I18nManager, View, ViewStyle } from 'react-native';
import { ActivityDayCell } from '@/components/presentation/calendar/activity-day-cell';
import { ActivityWeekCell } from '@/components/presentation/calendar/activity-week-cell';
import { cellEntrance } from '@/components/presentation/calendar/activity-entrance';

const ENTRANCE_DURATION_MS = 450;
/** Keeps every row's cells aligned under one another regardless of how long the names are. */
const LABEL_WIDTH = 64;
const TRAILING_WIDTH = 72;

export type ActivityDensity = 'month' | 'week';

interface ActivityCalendarProps {
  density: ActivityDensity;
  rows: ActivityRow[];
  firstDayOfWeek: DayOfWeek;
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

  const progress = useRef(new Animated.Value(0)).current;
  useMountEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: ENTRANCE_DURATION_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  });

  const totalCells = rows.reduce((total, row) => total + row.cells.length, 0);
  const isWeek = density === 'week';

  // Held so the memoized cells don't re-render on every parent render.
  const entrances = useMemo(
    () => Array.from({ length: totalCells }, (_, index) => cellEntrance(progress, index, totalCells)),
    [progress, totalCells],
  );

  return (
    <View style={{ alignItems: 'stretch', gap: spacing[1] }}>
      {header}

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[1] }}>
        {isWeek && <View style={{ width: LABEL_WIDTH }} />}
        <ForceLTRRow style={{ flex: 1, gap: spacing[1] }}>
          {Array.from({ length: 7 }, (_, offset) => {
            const dayOfWeek = ((offset + firstDayOfWeek.ordinal()) % 7) + 1;
            return (
              <SurfaceText
                key={dayOfWeek}
                font="text-xs"
                color="onSurfaceVariant"
                style={{ flex: 1, textAlign: 'center', letterSpacing: 0.6 }}
              >
                {formatDate(getDateOnDay(DayOfWeek.of(dayOfWeek)), { weekday: 'narrow' }).toUpperCase()}
              </SurfaceText>
            );
          })}
        </ForceLTRRow>
        {isWeek && renderRowTrailing && <View style={{ width: TRAILING_WIDTH }} />}
      </View>

      {rows.map((row, rowIndex) => {
        const cells = (
          <ForceLTRRow style={{ flex: 1, gap: spacing[1] }}>
            {row.cells.map((cell, columnIndex) => {
              // Position, not date: keying by date would remount all 42 cells on every month change.
              const entrance = entrances[rowIndex * 7 + columnIndex]!;

              return isWeek ? (
                <ActivityWeekCell key={columnIndex} cell={cell} entrance={entrance} />
              ) : (
                <ActivityDayCell
                  key={columnIndex}
                  cell={cell}
                  isSelected={!!selectedDate?.isEqual(cell.date)}
                  entrance={entrance}
                  onPress={onCellPress}
                />
              );
            })}
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
