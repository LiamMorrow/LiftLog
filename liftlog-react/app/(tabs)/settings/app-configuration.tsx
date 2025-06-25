import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import ListSwitch from '@/components/presentation/list-switch';
import SelectButton, {
  SelectButtonOption,
} from '@/components/presentation/select-button';
import ThemeChooser from '@/components/presentation/theme-chooser';
import { RootState, useAppSelector } from '@/store';
import {
  setColorSchemeSeed,
  setFirstDayOfWeek,
  setShowBodyweight,
  setShowFeed,
  setShowTips,
  setSplitWeightByDefault,
  setUseImperialUnits,
} from '@/store/settings';
import { formatDate, getDateOnDay } from '@/utils/format-date';
import { DayOfWeek } from '@js-joda/core';
import { T, useTranslate } from '@tolgee/react';
import { Stack } from 'expo-router';
import { Button, List } from 'react-native-paper';
import { useDispatch } from 'react-redux';

export default function AppConfiguration() {
  const { t } = useTranslate();
  const settings = useAppSelector((state: RootState) => state.settings);
  const dispatch = useDispatch();

  // TODO
  const resetTips = () => {};

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

  return (
    <FullHeightScrollView>
      <Stack.Screen options={{ title: t('AppConfiguration') }} />
      <List.Section>
        <ListSwitch
          headline={<T keyName="UseImperialUnits" />}
          supportingText={<T keyName="UseImperialUnitsSubtitle" />}
          value={settings.useImperialUnits}
          onValueChange={(value) => dispatch(setUseImperialUnits(value))}
        />
        <List.Item
          title={t('SetFirstDayOfWeek')}
          description={t('SetFirstDayOfWeekSubtitle')}
          right={() => (
            <SelectButton
              value={settings.firstDayOfWeek}
              options={daysOfWeekOptions}
              onChange={(value) => dispatch(setFirstDayOfWeek(value))}
            />
          )}
        />
        <ListSwitch
          headline={<T keyName="ShowBodyweight" />}
          supportingText={<T keyName="ShowBodyweightSubtitle" />}
          value={settings.showBodyweight}
          onValueChange={(value) => dispatch(setShowBodyweight(value))}
        />
        <ListSwitch
          data-cy="split-weight-toggle"
          headline={<T keyName="SplitWeightByDefault" />}
          supportingText={<T keyName="SplitWeightByDefaultSubtitle" />}
          value={settings.splitWeightByDefault}
          onValueChange={(value) => dispatch(setSplitWeightByDefault(value))}
        />
        <ListSwitch
          headline={<T keyName="ShowFeed" />}
          supportingText={<T keyName="ShowFeedSubtitle" />}
          value={settings.showFeed}
          onValueChange={(value) => dispatch(setShowFeed(value))}
        />

        <ListSwitch
          headline={<T keyName="ShowTips" />}
          supportingText={<T keyName="ShowTipsSubtitle" />}
          value={settings.showTips}
          onValueChange={(value) => dispatch(setShowTips(value))}
        />
        <Button mode="text" onPress={resetTips}>
          <T keyName="ResetTips" />
        </Button>

        <ThemeChooser
          seed={settings.colorSchemeSeed}
          onUpdateTheme={(x) => dispatch(setColorSchemeSeed(x))}
        />
      </List.Section>
    </FullHeightScrollView>
  );
}
