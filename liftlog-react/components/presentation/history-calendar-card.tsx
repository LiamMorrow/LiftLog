import { SurfaceText } from '@/components/presentation/surface-text';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { Session } from '@/models/session-models';
import { useAppSelector } from '@/store';
import { formatDate, getDateOnDay } from '@/utils/format-date';
import { DayOfWeek, LocalDate, Year, YearMonth } from '@js-joda/core';
import Enumerable from 'linq';
import { View } from 'react-native';
import { Card, IconButton, TouchableRipple } from 'react-native-paper';
import Animated, { ZoomIn } from 'react-native-reanimated';

const oneSeventh = `${100 / 7}%`;
const fiveSevenths = `${(100 / 7) * 5}%`;

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
    <>
      <View style={{ width: oneSeventh, marginVertical: spacing[2] }}>
        <IconButton
          data-cy="calendar-nav-previous-month"
          icon={'chevronLeft'}
          onPress={previousMonth}
        />
      </View>
      <View
        style={{
          width: fiveSevenths,
          marginVertical: spacing[2],
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <SurfaceText data-cy="calendar-month">
          {formatDate(firstDayOfMonth, {
            month: 'long',
            year:
              currentYearMonth.year() === Year.now().value()
                ? undefined
                : 'numeric',
          })}
        </SurfaceText>
      </View>

      <View style={{ width: oneSeventh, marginVertical: spacing[2] }}>
        <IconButton
          data-cy="calendar-nav-next-month"
          icon={'chevronRight'}
          onPress={nextMonth}
          disabled={disableNextMonth}
        />
      </View>
    </>
  );

  const dayHeaders = Array.from({ length: 7 }, (_, offset) => {
    const dayOfWeek = (offset + firstDayOfWeek.ordinal()) % 7;
    return (
      <SurfaceText
        key={dayOfWeek}
        style={{
          marginBottom: spacing[2],
          width: oneSeventh,
          textAlign: 'center',
        }}
      >
        {formatDate(getDateOnDay(DayOfWeek.of(dayOfWeek + 1)), {
          weekday: 'short',
        })}
      </SurfaceText>
    );
  });
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
          delayEntranceAnimMs={(dateEnterDelay += 5)}
          day={date}
          onPress={() => handleDayPress(date)}
          onLongPress={() => handleDayLongPress(date)}
        />
      );
    },
  );

  return (
    <Card style={{ marginHorizontal: spacing[2] }} mode="contained">
      <Card.Content>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          {navButtons}
          {dayHeaders}
          {daysFromPreviousMonth}
          {daysInMonth}
          {daysFromNextMonth}
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
  return (
    <Animated.View
      entering={ZoomIn.delay(props.delayEntranceAnimMs)}
      style={{
        width: oneSeventh,
        borderRadius: 1000,
        overflow: 'hidden',
      }}
    >
      <TouchableRipple
        onPress={props.onPress}
        onLongPress={props.onLongPress}
        disabled={isFuture}
        style={{ padding: spacing[1] }}
      >
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            aspectRatio: '1/1',
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
