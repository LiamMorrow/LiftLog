import { ActivityWeekCell } from '@/components/presentation/calendar/activity-week-cell';
import { cellEntrance } from '@/components/presentation/calendar/activity-entrance';
import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { spacing } from '@/hooks/useAppTheme';
import { useFormatDate } from '@/hooks/useFormatDate';
import { useMountEffect } from '@/hooks/useMountEffect';
import { ActivityCell } from '@/store/activity';
import { getDateOnDay } from '@/utils/format-date';
import { DayOfWeek } from '@js-joda/core';
import { useMemo, useRef } from 'react';
import { Animated, Easing, I18nManager, View } from 'react-native';

const ENTRANCE_DURATION_MS = 450;

interface WeekActivityStripProps {
  cells: ActivityCell[];
  firstDayOfWeek: DayOfWeek;
}

/**
 * The seven-day row `ActivityCalendar` draws in `week` density, minus the name and trailing columns it aligns
 * every row against. Here the row belongs to a single person already named above it, so those columns would
 * only eat the width the cells need.
 */
export function WeekActivityStrip({ cells, firstDayOfWeek }: WeekActivityStripProps) {
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

  const entrances = useMemo(
    () => Array.from({ length: cells.length }, (_, index) => cellEntrance(progress, index, cells.length)),
    [progress, cells.length],
  );

  const direction = I18nManager.isRTL ? 'row-reverse' : 'row';

  return (
    <View style={{ gap: spacing[1] }}>
      <View style={{ flexDirection: direction, gap: spacing[1] }}>
        {Array.from({ length: 7 }, (_, offset) => {
          const dayOfWeek = ((offset + firstDayOfWeek.ordinal()) % 7) + 1;
          return (
            <SurfaceText
              key={dayOfWeek}
              font="text-2xs"
              color="onSurfaceVariant"
              style={{ flex: 1, textAlign: 'center', letterSpacing: 0.6 }}
            >
              {formatDate(getDateOnDay(DayOfWeek.of(dayOfWeek)), { weekday: 'narrow' }).toUpperCase()}
            </SurfaceText>
          );
        })}
      </View>

      <View style={{ flexDirection: direction, gap: spacing[1] }}>
        {cells.map((cell, index) => (
          <ActivityWeekCell key={index} cell={cell} entrance={entrances[index]!} />
        ))}
      </View>
    </View>
  );
}
