import { SurfaceText } from '@/components/presentation/surface-text';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { Session } from '@/models/session-models';
import { useAppSelector } from '@/store';
import { LocalDate } from '@js-joda/core';
import { View } from 'react-native';
import { Card, IconButton } from 'react-native-paper';

const oneSeventh = `${100 / 7}%`;
const fiveSevenths = `${(100 / 7) * 5}%`;

interface HistoryCalendarCardProps {
  currentMonth: number;
  currentYear: number;

  onMonthChange: (date: LocalDate) => void;
  onDateSelect: (date: LocalDate) => void;
  onSessionLongPress: (session: Session) => void;
  onSessionPress: (Session: Session) => void;
}

export default function HistoryCalendarCard({
  currentYear,
  currentMonth,
  onMonthChange,
}: HistoryCalendarCardProps) {
  const firstDayOfMonth = LocalDate.of(currentYear, currentMonth, 1);
  const dayOfFirstDayOfTheMonth = firstDayOfMonth.dayOfWeek().value();
  const firstDayOfWeek = useAppSelector((x) => x.settings.firstDayOfWeek);
  const numberOfDaysToShowFromPreviousMonth =
    (dayOfFirstDayOfTheMonth - firstDayOfWeek + 7) % 7;

  const previousMonth = () => {
    if (currentMonth === 1) {
      currentMonth = 12;
      currentYear--;
    } else {
      currentMonth--;
    }
    onMonthChange(LocalDate.of(currentYear, currentMonth, 1));
  };

  const dayHeaders = Array.from({ length: 7 }, (_, offset) => {
    const dayOfWeek = (offset + firstDayOfWeek) % 7;
    return (
      <SurfaceText
        key={dayOfWeek}
        style={{
          marginBottom: spacing[2],
          width: oneSeventh,
          textAlign: 'center',
        }}
      >
        {formatDate(getDateOnDay(dayOfWeek), {
          weekday: 'short',
        })}
      </SurfaceText>
    );
  });
  const daysFromPreviousMonth = Array.from(
    { length: numberOfDaysToShowFromPreviousMonth },
    (_, offset) => {
      offset = offset - numberOfDaysToShowFromPreviousMonth;
      const date = firstDayOfMonth.plusDays(offset);
      return <HistoryCalendarDay key={date.toString()} day={date} />;
    },
  );

  const daysInMonth = Array.from(
    {
      length: firstDayOfMonth.lengthOfMonth(),
    },
    (_, i) => {
      const date = firstDayOfMonth.withDayOfMonth(i + 1);
      return <HistoryCalendarDay key={date.toString()} day={date} />;
    },
  );

  return (
    <Card style={{ marginHorizontal: spacing[2] }}>
      <Card.Content>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <View style={{ width: oneSeventh, marginVertical: spacing[2] }}>
            <IconButton
              data-cy="calendar-nav-previous-month"
              icon={'chevron_left'}
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
              })}
            </SurfaceText>
          </View>

          <View style={{ width: oneSeventh, marginVertical: spacing[2] }}>
            <IconButton
              data-cy="calendar-nav-next-month"
              icon={'chevron_right'}
            />
          </View>
          {dayHeaders}
          {daysFromPreviousMonth}
          {daysInMonth}
        </View>
      </Card.Content>
    </Card>
  );
}

function HistoryCalendarDay(props: { day: LocalDate }) {
  // TODO check no sessions
  const isTodayWithNoSessions = props.day.equals(LocalDate.now());
  const { colors } = useAppTheme();
  return (
    <View
      style={{
        width: oneSeventh,
        alignItems: 'center',
        justifyContent: 'center',
        aspectRatio: '1/1',
        borderRadius: 1000,
        borderColor: isTodayWithNoSessions ? colors.primary : 'transparent',
        borderWidth: 1,
      }}
    >
      <SurfaceText
        style={{ textAlign: 'center' }}
        color={isTodayWithNoSessions ? 'primary' : 'onSurface'}
      >
        {formatDate(props.day, { day: 'numeric' })}
      </SurfaceText>
    </View>
  );
}

function formatDate(date: LocalDate, opts: Intl.DateTimeFormatOptions) {
  return new Date(
    date.year(),
    date.month().ordinal(),
    date.dayOfMonth(),
  ).toLocaleString('default', opts);
}

function getDateOnDay(dayOfWeek: number) {
  // Super gross and hacky, but then we get i18n formatting for free
  const constantSundayDay = LocalDate.of(2025, 5, 4);
  const dateWithSpecifiedDayOfWeek = constantSundayDay.plusDays(dayOfWeek);
  return dateWithSpecifiedDayOfWeek;
}
