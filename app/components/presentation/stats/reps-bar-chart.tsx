import { verticalBarChartProps } from '@/components/presentation/stats/line-graph-props';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { RepsBreakdownStatistics } from '@/store/stats';
import { useTranslate } from '@tolgee/react';
import { useState } from 'react';
import { View } from 'react-native';
import { BarChart, barDataItem } from 'react-native-gifted-charts';
import { Text } from 'react-native-paper';

export function RepsBarChart({
  statistics: { breakdown },
}: {
  statistics: RepsBreakdownStatistics;
}) {
  const { t } = useTranslate();
  const { colors } = useAppTheme();
  const charWidth = 7;
  const items: barDataItem[] = Object.entries(breakdown)
    .map(([numberOfReps, { numberOfSets }]) => {
      const topLabelText = t(
        'stats.exercise.reps_breakdown_sets_bar_top.label',
        { sets: numberOfSets },
      );
      return {
        value: numberOfSets,
        label: numberOfReps,
        barWidth: charWidth * topLabelText.length,
        topLabelComponent: () => (
          <Text
            style={{ width: 200, textAlign: 'center', pointerEvents: 'none' }}
          >
            {topLabelText}
          </Text>
        ),
      } satisfies barDataItem;
    })
    .sort((a, b) => b.value - a.value);
  const [width, setWidth] = useState(0);

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <BarChart
        {...verticalBarChartProps(colors, width)}
        frontColor={colors.primary + 'CC'}
        showFractionalValues={false}
        scrollToEnd={false}
        noOfSections={4}
        roundedTop
        height={100}
        spacing={spacing[2]}
        data={items}
      />
    </View>
  );
}
