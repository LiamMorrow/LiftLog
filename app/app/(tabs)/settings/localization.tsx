import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import ListSwitch from '@/components/presentation/list-switch';
import SelectButton, {
  SelectButtonOption,
} from '@/components/presentation/select-button';
import { supportedLanguages } from '@/services/tolgee';
import { RootState, useAppSelector } from '@/store';
import {
  setFirstDayOfWeek,
  setPreferredLanguage,
  setUseImperialUnits,
} from '@/store/settings';
import { getDateOnDay } from '@/utils/format-date';
import { DayOfWeek } from '@js-joda/core';
import { T, useTranslate } from '@tolgee/react';
import { Stack } from 'expo-router';
import { useMemo } from 'react';
import { List } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { useFormatDate } from '@/hooks/useFormatDate';

export default function Localization() {
  const formatDate = useFormatDate();
  const { t } = useTranslate();
  const settings = useAppSelector((state: RootState) => state.settings);
  const dispatch = useDispatch();
  const daysOfWeekOptions: SelectButtonOption<DayOfWeek>[] = [
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

  const languageOptions: SelectButtonOption<string | undefined>[] = useMemo(
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
    <FullHeightScrollView>
      <Stack.Screen options={{ title: t('settings.localisation.title') }} />
      <List.Section>
        <ListSwitch
          testID="setUseImperialUnits"
          headline={<T keyName="settings.use_imperial_units.label" />}
          supportingText={<T keyName="settings.use_imperial_units.subtitle" />}
          value={settings.useImperialUnits}
          onValueChange={(value) => dispatch(setUseImperialUnits(value))}
        />
        <List.Item
          title={t('settings.first_day_of_week.label')}
          description={t('settings.first_day_of_week.subtitle')}
          right={() => (
            <SelectButton
              testID="setFirstDayOfWeek"
              value={settings.firstDayOfWeek}
              options={daysOfWeekOptions}
              onChange={(value) => dispatch(setFirstDayOfWeek(value))}
            />
          )}
        />
        <List.Item
          title={t('settings.set_language.button')}
          description={t('settings.set_language.subtitle')}
          right={() => (
            <SelectButton
              testID="setPreferredLanguage"
              value={settings.preferredLanguage}
              options={languageOptions}
              onChange={(value) => dispatch(setPreferredLanguage(value))}
            />
          )}
        />
      </List.Section>
    </FullHeightScrollView>
  );
}
