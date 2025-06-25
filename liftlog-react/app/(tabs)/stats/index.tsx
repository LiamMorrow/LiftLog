import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import { Loader } from '@/components/presentation/loader';
import SingleValueStatisticCard from '@/components/presentation/single-value-statistic-card';
import { SurfaceText } from '@/components/presentation/surface-text';
import { spacing } from '@/hooks/useAppTheme';
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
import { LineGraph } from 'react-native-graph';
import { Card } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { FlatGrid } from 'react-native-super-grid';
import WeightFormat from '@/components/presentation/weight-format';
import BigNumber from 'bignumber.js';

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
      <FullHeightScrollView contentContainerStyle={{ gap: spacing[4] }}>
        <View>
          <FlatGrid
            scrollEnabled={false}
            data={[0, 1, 2, 3]}
            maxItemsPerRow={2}
            renderItem={({ item }) => (
              <TopLevelStatCard index={item} stats={stats} />
            )}
          ></FlatGrid>
          <View style={{ flexDirection: 'row', gap: spacing[2] }}></View>
          <View style={{ flexDirection: 'row', gap: spacing[2] }}></View>
        </View>
        <Card>
          <Card.Content style={{ height: 300 }}>
            <LineGraph
              points={[
                {
                  date: new Date('2025-05-10T10:00:00Z'),
                  value: 10,
                },
                {
                  date: new Date('2025-05-11T10:00:00Z'),
                  value: 11,
                },
                {
                  date: new Date('2025-05-12T10:00:00Z'),
                  value: 11,
                },
              ]}
              style={{ flex: 1 }}
              color="#4484B2"
              animated={true}
              enablePanGesture={true}
              panGestureDelay={20}
            />
          </Card.Content>
        </Card>
      </FullHeightScrollView>
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
          <SurfaceText color="tertiary" font="text-xl" weight={'bold'}>
            {formatDuration(stats.averageTimeBetweenSets)}
          </SurfaceText>
        </SingleValueStatisticCard>
      );
    case 1:
      return (
        <SingleValueStatisticCard title={t('AverageSessionLength')}>
          <SurfaceText color="tertiary" font="text-xl" weight={'bold'}>
            {formatDuration(stats.averageSessionLength, true)}
          </SurfaceText>
        </SingleValueStatisticCard>
      );
    case 2:
      return (
        <SingleValueStatisticCard title={t('MostTimeSpent')}>
          <SurfaceText color="tertiary" font="text-xl" weight={'bold'}>
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
            <SurfaceText color="tertiary" font="text-xl" weight={'bold'}>
              {stats.heaviestLift?.exerciseName ?? '-'}
            </SurfaceText>
          </View>
        </SingleValueStatisticCard>
      );
  }
}
