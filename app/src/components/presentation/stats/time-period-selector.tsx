import SelectPicker from '@/components/presentation/foundation/select-picker';
import { SelectPickerOption } from '@/components/presentation/foundation/select-picker-props';
import { isLocalDateRangeEqual, LocalDateRange } from '@/models/time-models';
import { convert, LocalDate, nativeJs, Period } from '@js-joda/core';
import { useTranslate } from '@tolgee/react';
import { useState } from 'react';
import { DatePickerModal } from 'react-native-paper-dates';

type TimePeriodSelectorProps = {
  timePeriod: LocalDateRange | 'all-time';
  setTimePeriod: (value: LocalDateRange | 'all-time') => void;
};

export function TimePeriodSelector({ timePeriod, setTimePeriod }: TimePeriodSelectorProps) {
  const today = LocalDate.now();
  const [timeRangeSelectorOpen, setTimeRangeSelectorOpen] = useState(false);
  const { t } = useTranslate();
  const timeOptions: SelectPickerOption<LocalDateRange | 'all-time' | 'custom'>[] = [
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
      value: 'all-time',
    },
    {
      label: t('time_period_select.custom.label'),
      value: 'custom',
    },
  ];
  const nonCustomValues: SelectPickerOption<LocalDateRange>[] = timeOptions.filter(
    (x): x is SelectPickerOption<LocalDateRange> => x.value !== 'custom' && x.value !== 'all-time',
  );

  const activeCustomRange =
    timePeriod !== 'all-time' && !nonCustomValues.some((x) => isLocalDateRangeEqual(x.value, timePeriod))
      ? timePeriod
      : undefined;
  const options: SelectPickerOption<LocalDateRange | 'all-time' | 'custom'>[] = activeCustomRange
    ? [
        ...timeOptions,
        {
          label: `${activeCustomRange.from.toString()} - ${activeCustomRange.to.toString()}`,
          value: activeCustomRange,
        },
      ]
    : timeOptions;

  function handleCustomRangePicked(params: { startDate: Date | undefined; endDate: Date | undefined }) {
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
      <SelectPicker
        testID="stats-time-selector"
        value={timePeriod}
        options={options}
        onChange={(value) => {
          if (value === 'custom') {
            setTimeRangeSelectorOpen(true);
          } else {
            setTimePeriod(value);
          }
        }}
      />
      {timePeriod !== 'all-time' && (
        <DatePickerModal
          locale="default"
          mode="range"
          visible={timeRangeSelectorOpen}
          onDismiss={() => setTimeRangeSelectorOpen(false)}
          onConfirm={handleCustomRangePicked}
          startDate={convert(timePeriod.from).toDate()}
          endDate={convert(timePeriod.to).toDate()}
        />
      )}
    </>
  );
}

function getPeriod(period: Period, today: LocalDate) {
  return {
    from: today.minus(period),
    to: today,
  };
}
