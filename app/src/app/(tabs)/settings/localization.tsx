import { SettingsPage } from '@/components/layout/settings-page';
import { SegmentedGroup } from '@/components/presentation/foundation/segmented-list';
import { SegmentedListSwitch } from '@/components/presentation/foundation/segmented-list-switch';
import { SegmentedListSelect } from '@/components/presentation/foundation/segmented-list-select';
import { SelectPickerOption } from '@/components/presentation/foundation/select-picker';
import { supportedLanguages } from '@/services/tolgee';
import { RootState, useAppSelector } from '@/store';
import { setFirstDayOfWeek, setPreferredLanguage, setUseImperialUnits } from '@/store/settings';
import { getDateOnDay } from '@/utils/format-date';
import { DayOfWeek } from '@js-joda/core';
import { useTranslate } from '@tolgee/react';
import { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useFormatDate } from '@/hooks/useFormatDate';

export default function LocalizationPage() {
  const formatDate = useFormatDate();
  const { t } = useTranslate();
  const settings = useAppSelector((state: RootState) => state.settings);
  const dispatch = useDispatch();
  const daysOfWeekOptions: SelectPickerOption<DayOfWeek>[] = [
    {
      value: DayOfWeek.SUNDAY,
      label: formatDate(getDateOnDay(DayOfWeek.SUNDAY), {
        weekday: 'long',
      }),
    },
    {
      value: DayOfWeek.MONDAY,
      label: formatDate(getDateOnDay(DayOfWeek.MONDAY), {
        weekday: 'long',
      }),
    },
    {
      value: DayOfWeek.TUESDAY,
      label: formatDate(getDateOnDay(DayOfWeek.TUESDAY), {
        weekday: 'long',
      }),
    },
    {
      value: DayOfWeek.WEDNESDAY,
      label: formatDate(getDateOnDay(DayOfWeek.WEDNESDAY), {
        weekday: 'long',
      }),
    },
    {
      value: DayOfWeek.THURSDAY,
      label: formatDate(getDateOnDay(DayOfWeek.THURSDAY), {
        weekday: 'long',
      }),
    },
    {
      value: DayOfWeek.FRIDAY,
      label: formatDate(getDateOnDay(DayOfWeek.FRIDAY), {
        weekday: 'long',
      }),
    },
    {
      value: DayOfWeek.SATURDAY,
      label: formatDate(getDateOnDay(DayOfWeek.SATURDAY), {
        weekday: 'long',
      }),
    },
  ];

  const languageOptions: SelectPickerOption<string | undefined>[] = useMemo(
    () => [
      {
        value: undefined,
        label: t('settings.system_default.label'),
      },
      ...supportedLanguages.map((x) => ({ value: x.code, label: x.label })),
    ],
    [t],
  );

  return (
    <SettingsPage title={t('settings.localisation.title')} caption={t('settings.localisation.subtitle')}>
      <SegmentedGroup>
        <SegmentedListSwitch
          testID="setUseImperialUnits"
          icon={'weight'}
          label={t('settings.use_imperial_units.label')}
          supportingText={t('settings.use_imperial_units.subtitle')}
          value={settings.useImperialUnits}
          onValueChange={(value) => dispatch(setUseImperialUnits(value))}
        />
        <SegmentedListSelect
          testID="setFirstDayOfWeek"
          icon={'calendar'}
          label={t('settings.first_day_of_week.label')}
          supportingText={t('settings.first_day_of_week.subtitle')}
          value={settings.firstDayOfWeek}
          options={daysOfWeekOptions}
          onChange={(value) => dispatch(setFirstDayOfWeek(value))}
        />
        <SegmentedListSelect
          testID="setPreferredLanguage"
          icon={'language'}
          label={t('settings.set_language.button')}
          supportingText={t('settings.set_language.subtitle')}
          value={settings.preferredLanguage}
          options={languageOptions}
          onChange={(value) => dispatch(setPreferredLanguage(value))}
        />
      </SegmentedGroup>
    </SettingsPage>
  );
}
