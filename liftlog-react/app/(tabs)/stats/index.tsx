import { Loader } from '@/components/presentation/loader';
import SingleValueStatisticCard from '@/components/presentation/single-value-statistic-card';
import { SurfaceText } from '@/components/presentation/surface-text';
import { useAppSelector } from '@/store';
import {
  fetchOverallStats,
  GranularStatisticView,
  selectOverallView,
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
import StatGraphCard from '@/components/presentation/stat-graph-card';

export default function StatsPage() {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  useFocusEffect(() => {
    dispatch(fetchOverallStats());
  });
  const stats = useAppSelector(selectOverallView);
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
        ListHeaderComponent={() => (
          <FlatGrid
            scrollEnabled={false}
            data={[0, 1, 2, 3]}
            maxItemsPerRow={2}
            renderItem={({ item }) => (
              <TopLevelStatCard index={item} stats={stats} />
            )}
          ></FlatGrid>
        )}
        data={stats.exerciseStats}
        renderItem={({ item }) => (
          <StatGraphCard exerciseStats={item} title={item.exerciseName} />
        )}
      />
    </>
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
