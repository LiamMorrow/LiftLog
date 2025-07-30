import { Loader } from '@/components/presentation/loader';
import SingleValueStatisticCard from '@/components/presentation/single-value-statistic-card';
import { SurfaceText } from '@/components/presentation/surface-text';
import { useAppSelector, useAppSelectorWithArg } from '@/store';
import {
  fetchOverallStats,
  GranularStatisticView,
  selectOverallView,
  setOverallViewSession,
  setOverallViewTime,
  setStatsIsDirty,
} from '@/store/stats';
import formatDuration from '@/utils/format-date';
import { useTranslate } from '@tolgee/react';
import { Stack, useFocusEffect } from 'expo-router';
import { View } from 'react-native';
import { useDispatch } from 'react-redux';
import { FlatGrid } from 'react-native-super-grid';
import WeightFormat from '@/components/presentation/weight-format';
import BigNumber from 'bignumber.js';
import { FlatList } from 'react-native-gesture-handler';
import ExerciseStatGraphCard from '@/components/presentation/exercise-stat-graph-card';
import { spacing } from '@/hooks/useAppTheme';
import SelectButton, {
  SelectButtonOption,
} from '@/components/presentation/select-button';
import { LocalDate, Period } from '@js-joda/core';
import { selectCompletedDistinctSessionNames } from '@/store/stored-sessions';
import { Divider, Searchbar } from 'react-native-paper';
import { useState } from 'react';
import BodyweightStatGraphCard from '@/components/presentation/bodyweight-stat-graph-card';
import { useScroll } from '@/hooks/useScollListener';

export default function StatsPage() {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  useFocusEffect(() => {
    dispatch(fetchOverallStats());
  });
  const stats = useAppSelector(selectOverallView);
  const [searchText, setSearchText] = useState<string>('');
  const { handleScroll } = useScroll();
  if (!stats) {
    return <Loader />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: t('Statistics'),
        }}
      />
      <FlatList
        onScroll={handleScroll}
        ListHeaderComponent={
          <ListHeader
            searchText={searchText}
            setSearchText={setSearchText}
            stats={stats}
          />
        }
        data={stats.exerciseStats.filter((x) =>
          x.exerciseName
            .toLocaleLowerCase()
            .includes(searchText.toLocaleLowerCase()),
        )}
        ItemSeparatorComponent={() => (
          <Divider style={{ marginVertical: spacing[4] }} />
        )}
        keyExtractor={(item) => item.exerciseName}
        renderItem={({ item }) => (
          <ExerciseStatGraphCard
            exerciseStats={item}
            title={item.exerciseName}
          />
        )}
      />
    </>
  );
}

function ListHeader({
  stats,
  searchText,
  setSearchText,
}: {
  stats: GranularStatisticView;
  searchText: string;
  setSearchText: (value: string) => void;
}) {
  const time = useAppSelector((x) => x.stats.overallViewTime);
  const sessionName = useAppSelector((x) => x.stats.overallViewSessionName);
  const sessionNames = useAppSelectorWithArg(
    selectCompletedDistinctSessionNames,
    LocalDate.now().minus(time),
  );
  const dispatch = useDispatch();
  const { t } = useTranslate();
  const timeOptions: SelectButtonOption<Period>[] = [
    { label: t('{NumDays}NumDays', { 0: '7' }), value: Period.ofDays(7) },
    { label: t('{NumDays}NumDays', { 0: '14' }), value: Period.ofDays(14) },
    { label: t('{NumDays}NumDays', { 0: '30' }), value: Period.ofDays(30) },
    { label: t('{NumDays}NumDays', { 0: '90' }), value: Period.ofDays(90) },
    { label: t('{NumDays}NumDays', { 0: '180' }), value: Period.ofDays(180) },
    { label: t('{NumDays}NumDays', { 0: '365' }), value: Period.ofDays(365) },
    { label: t('AllTime'), value: Period.ofDays(36500) },
  ];
  const sessions: SelectButtonOption<string | undefined>[] = sessionNames
    .map((value) => ({
      label: value,
      value: value as string | undefined,
    }))
    .concat({
      value: undefined,
      label: t('AllSessions'),
    });
  return (
    <View style={{ gap: spacing[2], marginBottom: spacing[2] }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <SelectButton
          value={sessionName}
          options={sessions}
          onChange={(name) => {
            dispatch(setOverallViewSession(name));
            dispatch(setStatsIsDirty(true));
            dispatch(fetchOverallStats());
          }}
        />
        <SelectButton
          testID="stats-time-selector"
          value={time}
          options={timeOptions}
          onChange={(x) => {
            dispatch(setOverallViewTime(x));
            dispatch(setStatsIsDirty(true));
            dispatch(fetchOverallStats());
          }}
        />
      </View>
      <Searchbar
        placeholder={t('Search')}
        value={searchText}
        onChangeText={setSearchText}
        style={{ marginHorizontal: spacing.pageHorizontalMargin }}
      />
      {searchText ? undefined : (
        <>
          <FlatGrid
            scrollEnabled={false}
            data={[0, 1, 2, 3]}
            maxItemsPerRow={2}
            renderItem={({ item }) => (
              <TopLevelStatCard index={item} stats={stats} />
            )}
          ></FlatGrid>
          <BodyweightStatGraphCard bodyweightStats={stats.bodyweightStats} />
        </>
      )}
    </View>
  );
}

function TopLevelStatCard(props: {
  index: number;
  stats: GranularStatisticView;
}) {
  const { t } = useTranslate();
  const { stats, index } = props;
  switch (index) {
    case 0:
      return (
        <SingleValueStatisticCard title={t('AverageTimeBetweenSets')}>
          <SurfaceText
            color="tertiary"
            font="text-xl"
            weight={'bold'}
            style={{ textAlign: 'center' }}
          >
            {formatDuration(stats.averageTimeBetweenSets)}
          </SurfaceText>
        </SingleValueStatisticCard>
      );
    case 1:
      return (
        <SingleValueStatisticCard title={t('AverageSessionLength')}>
          <SurfaceText
            color="tertiary"
            font="text-xl"
            weight={'bold'}
            style={{ textAlign: 'center' }}
          >
            {formatDuration(stats.averageSessionLength, true)}
          </SurfaceText>
        </SingleValueStatisticCard>
      );
    case 2:
      return (
        <SingleValueStatisticCard title={t('MostTimeSpent')}>
          <SurfaceText
            color="tertiary"
            font="text-xl"
            weight={'bold'}
            style={{ textAlign: 'center' }}
          >
            {stats.exerciseMostTimeSpent?.exerciseName ?? '-'}
          </SurfaceText>
        </SingleValueStatisticCard>
      );
    case 3:
      return (
        <SingleValueStatisticCard title={t('HeaviestLift')}>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <WeightFormat
              color={'tertiary'}
              fontSize="text-xl"
              fontWeight={'bold'}
              weight={stats.heaviestLift?.weight ?? BigNumber(0)}
            />
            <SurfaceText
              color="tertiary"
              font="text-xl"
              weight={'bold'}
              style={{ textAlign: 'center' }}
            >
              {stats.heaviestLift?.exerciseName ?? '-'}
            </SurfaceText>
          </View>
        </SingleValueStatisticCard>
      );
  }
}
