import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { spacing } from '@/hooks/useAppTheme';
import { useFormatDate } from '@/hooks/useFormatDate';
import { ActivityCell, ActivityRow } from '@/store/activity';
import { getDateOnDay } from '@/utils/format-date';
import { DayOfWeek, LocalDate } from '@js-joda/core';
import { ReactNode } from 'react';
import { I18nManager, View, ViewStyle } from 'react-native';
import { ActivityDayCell } from '@/components/presentation/calendar/activity-day-cell';

const ENTRANCE_STAGGER_MS = 5;
/** Keeps every week row's cells aligned under one another regardless of how long the names are. */
const LABEL_WIDTH = 64;

export type ActivityDensity = 'month' | 'week';

interface ActivityCalendarProps {
  density: ActivityDensity;
  rows: ActivityRow[];
  firstDayOfWeek: DayOfWeek;
  selectedDate?: LocalDate;
  header?: ReactNode;
  footer?: ReactNode;
  onCellPress?: (cell: ActivityCell) => void;
}

export function ActivityCalendar({
  density,
  rows,
  firstDayOfWeek,
  selectedDate,
  header,
  footer,
  onCellPress,
}: ActivityCalendarProps) {
  const formatDate = useFormatDate();

  return (
    <View style={{ alignItems: 'stretch', gap: spacing[1] }}>
      {header}

      {density === 'month' && (
        <ForceLTRRow>
          {Array.from({ length: 7 }, (_, offset) => {
            const dayOfWeek = ((offset + firstDayOfWeek.ordinal()) % 7) + 1;
            return (
              <View style={{ flex: 1 }} key={dayOfWeek}>
                <SurfaceText style={{ marginBottom: spacing[2], textAlign: 'center' }}>
                  {formatDate(getDateOnDay(DayOfWeek.of(dayOfWeek)), { weekday: 'short' })}
                </SurfaceText>
              </View>
            );
          })}
        </ForceLTRRow>
      )}

      {rows.map((row, rowIndex) => {
        const cells = (
          <ForceLTRRow style={{ flex: 1 }}>
            {row.cells.map((cell, columnIndex) => (
              <ActivityDayCell
                key={cell.date.toString()}
                cell={cell}
                isSelected={!!selectedDate?.isEqual(cell.date)}
                // Derived from position rather than a mutating counter, so it stays pure across re-renders.
                entranceDelayMs={(rowIndex * 7 + columnIndex) * ENTRANCE_STAGGER_MS}
                onPress={onCellPress}
              />
            ))}
          </ForceLTRRow>
        );

        if (density === 'week') {
          return (
            <View key={row.key} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[1] }}>
              {row.label !== undefined && (
                <SurfaceText font="text-sm" color="onSurfaceVariant" numberOfLines={1} style={{ width: LABEL_WIDTH }}>
                  {row.label}
                </SurfaceText>
              )}
              {cells}
            </View>
          );
        }

        return (
          <View key={row.key} style={{ gap: spacing[1] }}>
            {row.label !== undefined && (
              <SurfaceText font="text-sm" color="onSurfaceVariant" numberOfLines={1}>
                {row.label}
              </SurfaceText>
            )}
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
