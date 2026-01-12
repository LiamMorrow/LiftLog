import { SurfaceText } from '@/components/presentation/surface-text';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { Session } from '@/models/session-models';
import { useAppSelector } from '@/store';
import { getDateOnDay } from '@/utils/format-date';
import { DayOfWeek, LocalDate, Year, YearMonth } from '@js-joda/core';
import Enumerable from 'linq';
import { I18nManager, View } from 'react-native';
import { Card } from 'react-native-paper';
import IconButton from '@/components/presentation/gesture-wrappers/icon-button';
import TouchableRipple from '@/components/presentation/gesture-wrappers/touchable-ripple';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { ReactNode } from 'react';
import { useFormatDate } from '@/hooks/useFormatDate';

interface HistoryCalendarCardProps {
  currentYearMonth: YearMonth;
  sessions: Session[];

  onMonthChange: (date: YearMonth) => void;
  onDateSelect: (date: LocalDate) => void;
  onSessionSelect: (Session: Session) => void;
  onDeleteSession: (session: Session) => void;
}

export default function HistoryCalendarCard({
  currentYearMonth,
  sessions,
  onMonthChange,
  onDateSelect,
  onSessionSelect,
  onDeleteSession,
}: HistoryCalendarCardProps) {
  const firstDayOfMonth = LocalDate.of(
    currentYearMonth.year(),
    currentYearMonth.month(),
    1,
  );
  const formatDate = useFormatDate();
  const dayOfFirstDayOfTheMonth = firstDayOfMonth.dayOfWeek().value();
  const firstDayOfWeek = useAppSelector((x) => x.settings.firstDayOfWeek);
  const numberOfDaysToShowFromPreviousMonth =
    (dayOfFirstDayOfTheMonth - firstDayOfWeek.value() + 7) % 7;
  const numberOfDaysToShowFromNextMonth =
    (7 -
      ((numberOfDaysToShowFromPreviousMonth +
        currentYearMonth.lengthOfMonth()) %
        7)) %
    7;
  const disableNextMonth = currentYearMonth.equals(YearMonth.now());

  const sessionsByDate = Enumerable.from(sessions).toLookup((x) =>
    x.date.toString(),
  );

  const previousMonth = () => {
    onMonthChange(currentYearMonth.minusMonths(1));
  };
  const nextMonth = () => {
    onMonthChange(currentYearMonth.plusMonths(1));
  };

  const handleDayPress = (date: LocalDate) => {
    const sessionsForDate = sessionsByDate.get(date.toString());
    if (sessionsForDate.any()) {
      onSessionSelect(sessionsForDate.first());
    } else {
      onDateSelect(date);
    }
  };
  const handleDayLongPress = (date: LocalDate) => {
    const sessionsForDate = sessionsByDate.get(date.toString());
    if (sessionsForDate.any()) {
      onDeleteSession(sessionsForDate.first());
    }
  };

  const navButtons = (
    <ForceLTRRow>
      <View style={{ flex: 1, marginVertical: spacing[2] }}>
        <IconButton
          testID="calendar-nav-previous-month"
          icon={'chevronLeft'}
          onPress={previousMonth}
        />
      </View>
      <View
        style={{
          flex: 5,
          marginVertical: spacing[2],
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <SurfaceText testID="calendar-month">
          {formatDate(firstDayOfMonth, {
            month: 'long',
            year:
              currentYearMonth.year() === Year.now().value()
                ? undefined
                : 'numeric',
          })}
        </SurfaceText>
      </View>

      <View style={{ flex: 1, marginVertical: spacing[2] }}>
        <IconButton
          testID="calendar-nav-next-month"
          icon={'chevronRight'}
          onPress={nextMonth}
          disabled={disableNextMonth}
        />
      </View>
    </ForceLTRRow>
  );

  const dayHeaders = (
    <ForceLTRRow>
      {Array.from({ length: 7 }, (_, offset) => {
        const dayOfWeek = (offset + firstDayOfWeek.ordinal()) % 7;
        return (
          <View
            style={{
              flex: 1,
            }}
            key={dayOfWeek}
          >
            <SurfaceText
              key={dayOfWeek}
              style={{
                marginBottom: spacing[2],
                textAlign: 'center',
              }}
            >
              {formatDate(getDateOnDay(DayOfWeek.of(dayOfWeek + 1)), {
                weekday: 'short',
              })}
            </SurfaceText>
          </View>
        );
      })}
    </ForceLTRRow>
  );
  let dateEnterDelay = 0;
  const daysFromPreviousMonth = Array.from(
    { length: numberOfDaysToShowFromPreviousMonth },
    (_, offset) => {
      offset = offset - numberOfDaysToShowFromPreviousMonth;
      const date = firstDayOfMonth.plusDays(offset);
      return (
        <HistoryCalendarDay
          key={date.toString() + dateEnterDelay}
          sessions={sessionsByDate.get(date.toString())}
          // eslint-disable-next-line react-compiler/react-compiler
          delayEntranceAnimMs={(dateEnterDelay += 5)}
          day={date}
          onPress={() => handleDayPress(date)}
          onLongPress={() => handleDayLongPress(date)}
        />
      );
    },
  );

  const daysInMonth = Array.from(
    {
      length: firstDayOfMonth.lengthOfMonth(),
    },
    (_, i) => {
      const date = firstDayOfMonth.withDayOfMonth(i + 1);
      return (
        <HistoryCalendarDay
          key={date.toString() + dateEnterDelay}
          sessions={sessionsByDate.get(date.toString())}
          delayEntranceAnimMs={(dateEnterDelay += 5)}
          day={date}
          onPress={() => handleDayPress(date)}
          onLongPress={() => handleDayLongPress(date)}
        />
      );
    },
  );

  const daysFromNextMonth = Array.from(
    { length: numberOfDaysToShowFromNextMonth },
    (_, i) => {
      const date = firstDayOfMonth.plusMonths(1).withDayOfMonth(i + 1);
      return (
        <HistoryCalendarDay
          key={date.toString() + dateEnterDelay}
          sessions={sessionsByDate.get(date.toString())}
          // eslint-disable-next-line react-compiler/react-compiler
          delayEntranceAnimMs={(dateEnterDelay += 5)}
          day={date}
          onPress={() => handleDayPress(date)}
          onLongPress={() => handleDayLongPress(date)}
        />
      );
    },
  );
  const daysInSections = [daysFromPreviousMonth, daysInMonth, daysFromNextMonth]
    .flat()
    .reduce(
      (acc, cur) => {
        if (acc[acc.length - 1].length === 7) {
          acc.push([]);
        }
        acc[acc.length - 1].push(cur);
        return acc;
      },
      [[]] as ReactNode[][],
    );

  return (
    <Card mode="contained">
      <Card.Content>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'stretch',
            flex: 3,
          }}
        >
          {navButtons}
          {dayHeaders}
          {daysInSections.map((days, i) => (
            <ForceLTRRow key={i}>{days}</ForceLTRRow>
          ))}
        </View>
      </Card.Content>
    </Card>
  );
}

function HistoryCalendarDay(props: {
  day: LocalDate;
  sessions: Enumerable.IEnumerable<Session>;
  delayEntranceAnimMs: number;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const isFuture = props.day.isAfter(LocalDate.now());
  const hasSessions = props.sessions.any();
  const isTodayWithNoSessions =
    props.day.equals(LocalDate.now()) && !hasSessions;
  const { colors } = useAppTheme();
  const formatDate = useFormatDate();
  return (
    <Animated.View
      entering={ZoomIn.delay(props.delayEntranceAnimMs)}
      style={{
        flex: 1,
        borderRadius: 1000,
        overflow: 'hidden',
        alignItems: 'center',
      }}
    >
      <TouchableRipple
        onPress={props.onPress}
        onLongPress={props.onLongPress}
        disabled={isFuture}
        style={{
          padding: spacing[1],
          borderRadius: 1000,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            aspectRatio: '1/1',
            width: spacing[10],
            borderRadius: 1000,
            borderColor: isTodayWithNoSessions ? colors.primary : 'transparent',
            borderWidth: 1,
            backgroundColor: props.sessions.any()
              ? colors.primary
              : 'transparent',
          }}
        >
          <SurfaceText
            style={{ textAlign: 'center' }}
            color={hasSessions ? 'onPrimary' : 'onSurface'}
          >
            {formatDate(props.day, { day: 'numeric' })}
          </SurfaceText>
        </View>
      </TouchableRipple>
    </Animated.View>
  );
}

/**
 * Our app automatically swaps layout directions for RTL, however, we don't want to do this for our calendar
 * @returns
 */
function ForceLTRRow(props: { children: ReactNode }) {
  const rtl = I18nManager.isRTL;
  return (
    <View style={{ flexDirection: rtl ? 'row-reverse' : 'row' }}>
      {props.children}
    </View>
  );
}
