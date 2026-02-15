import SelectButton, {
  SelectButtonOption,
} from '@/components/presentation/foundation/select-button';
import { isLocalDateRangeEqual, LocalDateRange } from '@/models/time-models';
import { convert, LocalDate, nativeJs, Period } from '@js-joda/core';
import { useTranslate } from '@tolgee/react';
import { useState } from 'react';
import { DatePickerModal } from 'react-native-paper-dates';

type TimePeriodSelectorProps = {
  timePeriod: LocalDateRange;
  setTimePeriod: (value: LocalDateRange) => void;
};

export function TimePeriodSelector({
  timePeriod,
  setTimePeriod,
}: TimePeriodSelectorProps) {
  const today = LocalDate.now();
  const [timeRangeSelectorOpen, setTimeRangeSelectorOpen] = useState(false);
  const { t } = useTranslate();
  const timeOptions: SelectButtonOption<LocalDateRange | 'custom'>[] = [
    {
      label: t('time_period_select.num_days.label', { count: '7' }),
      value: getPeriod(Period.ofDays(7), today),
    },
    {
      label: t('time_period_select.num_days.label', { count: '14' }),
      value: getPeriod(Period.ofDays(14), today),
    },
    {
      label: t('time_period_select.num_days.label', { count: '30' }),
      value: getPeriod(Period.ofDays(30), today),
    },
    {
      label: t('time_period_select.num_days.label', { count: '90' }),
      value: getPeriod(Period.ofDays(90), today),
    },
    {
      label: t('time_period_select.num_days.label', { count: '180' }),
      value: getPeriod(Period.ofDays(180), today),
    },
    {
      label: t('time_period_select.num_days.label', { count: '365' }),
      value: getPeriod(Period.ofDays(365), today),
    },
    {
      label: t('time_period_select.all_time.label'),
      value: getPeriod(Period.ofDays(36500), today),
    },
    {
      label: t('time_period_select.custom.label'),
      value: 'custom',
    },
  ];
  const nonCustomValues: SelectButtonOption<LocalDateRange>[] =
    timeOptions.filter(
      (x): x is SelectButtonOption<LocalDateRange> => x.value !== 'custom',
    );

  function handleCustomRangePicked(params: {
    startDate: Date | undefined;
    endDate: Date | undefined;
  }) {
    setTimeRangeSelectorOpen(false);
    if (!params.startDate || !params.endDate) {
      return;
    }
    setTimePeriod({
      from: nativeJs(params.startDate).toLocalDate(),
      to: nativeJs(params.endDate).toLocalDate(),
    });
  }

  return (
    <>
      <SelectButton
        testID="stats-time-selector"
        value={timePeriod}
        buttonProps={{ mode: 'outlined' }}
        options={timeOptions}
        renderLabel={() => {
          const builtInTime = nonCustomValues.find((x) =>
            isLocalDateRangeEqual(x.value, timePeriod),
          );
          if (!builtInTime) {
            return `${timePeriod.from.toString()} - ${timePeriod.to.toString()}`;
          }
          return builtInTime.label;
        }}
        onChange={(value) => {
          if (value === 'custom') {
            setTimeRangeSelectorOpen(true);
          } else {
            setTimePeriod(value);
          }
        }}
      />
      <DatePickerModal
        locale="default"
        mode="range"
        visible={timeRangeSelectorOpen}
        onDismiss={() => setTimeRangeSelectorOpen(false)}
        onConfirm={handleCustomRangePicked}
        startDate={convert(timePeriod.from).toDate()}
        endDate={convert(timePeriod.to).toDate()}
      />
    </>
  );
}

function getPeriod(period: Period, today: LocalDate) {
  return {
    from: today.minus(period),
    to: today,
  };
}
