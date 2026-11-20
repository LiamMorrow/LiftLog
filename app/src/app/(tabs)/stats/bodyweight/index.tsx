import { Card, CardContent } from '@/components/foundation/card';
import EmptyInfo from '@/components/foundation/empty-info';
import { PageActions } from '@/components/foundation/page-actions';
import { Remote } from '@/components/foundation/remote';
import { SegmentedGroup } from '@/components/foundation/segmented-list';
import { SegmentedListLink } from '@/components/foundation/segmented-list-link';
import SegmentedPicker from '@/components/foundation/segmented-picker';
import { TitledSection } from '@/components/foundation/titled-section';
import { SettingsPage } from '@/components/layout/settings-page';
import { useLoadAxis } from '@/components/stats/quantity-axis';
import { StatisticLineChart } from '@/components/stats/statistic-line-chart';
import { readBodyweightEntries } from '@/db/bodyweight-entries';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useFormatDate } from '@/hooks/useFormatDate';
import { useSessionsQuery } from '@/hooks/useSessionsQuery';
import { useAppSelector } from '@/store';
import { fetchOverallStats, selectOverallView, setOverallViewTime } from '@/store/stats';
import { uuid } from '@/utils/uuid';
import AddIcon from '@expo/material-symbols/add.xml';
import { LocalDate } from '@js-joda/core';
import { useTranslate } from '@tolgee/react';
import { useFocusEffect, useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';

export default function BodyweightPage() {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const { push } = useRouter();
  const { colors } = useAppTheme();
  const formatDate = useFormatDate();
  const loadAxis = useLoadAxis();
  const timePeriod = useAppSelector((x) => x.stats.overallViewTime);
  const revision = useAppSelector((x) => x.stats.bodyweightRevision);
  const stats = useAppSelector(selectOverallView);
  const entries = useSessionsQuery(readBodyweightEntries, `bodyweight-entries-${revision}`) ?? [];
  useFocusEffect(() => {
    dispatch(fetchOverallStats());
  });
  const today = LocalDate.now();
  const periods = [
    { label: t('time_period_select.num_months.short_label', { count: '1' }), value: 30 },
    { label: t('time_period_select.num_months.short_label', { count: '3' }), value: 90 },
    { label: t('time_period_select.num_months.short_label', { count: '6' }), value: 180 },
    { label: t('time_period_select.one_year.short_label'), value: 365 },
    { label: t('time_period_select.all_time.label'), value: 0 },
  ];
  const selectedPeriod =
    timePeriod === 'all-time'
      ? 0
      : timePeriod.to.equals(today)
        ? timePeriod.to.toEpochDay() - timePeriod.from.toEpochDay()
        : -1;

  return (
    <SettingsPage
      title={t('exercise.bodyweight.label')}
      actions={
        <PageActions
          primaryKind="surface"
          primary={{
            label: t('stats.bodyweight.add.button'),
            onPress: () => push(`/stats/bodyweight/${uuid()}`),
            icon: AddIcon,
            systemImage: 'plus',
          }}
        />
      }
    >
      <SegmentedPicker
        value={selectedPeriod}
        options={periods}
        onChange={(days) =>
          dispatch(setOverallViewTime(days ? { from: today.minusDays(days), to: today } : 'all-time'))
        }
      />
      <Remote
        value={stats}
        error={() => null}
        success={({ bodyweightStats }) =>
          bodyweightStats.statistics.length ? (
            <Card style={{ backgroundColor: colors.surfaceContainer }}>
              <CardContent>
                <StatisticLineChart key={selectedPeriod} statistics={bodyweightStats} axis={loadAxis} fitToWidth />
              </CardContent>
            </Card>
          ) : null
        }
      />
      <TitledSection title={t('stats.bodyweight.entries.title')}>
        {entries.length ? (
          <SegmentedGroup>
            {entries.map((entry) => (
              <SegmentedListLink
                key={entry.id}
                label={formatDate(entry.date, { day: 'numeric', month: 'short', year: 'numeric' })}
                value={entry.weight.shortLocaleFormat()}
                onPress={() => push(`/stats/bodyweight/${entry.id}`)}
              />
            ))}
          </SegmentedGroup>
        ) : (
          <EmptyInfo>{t('stats.bodyweight.empty.message')}</EmptyInfo>
        )}
      </TitledSection>
    </SettingsPage>
  );
}
