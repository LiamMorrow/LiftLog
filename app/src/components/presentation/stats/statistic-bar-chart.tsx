import { StatisticOverTime } from '@/store/stats';
import { QuantityAxis } from '@/components/presentation/stats/quantity-axis';
import { BarChart, barDataItem } from 'react-native-gifted-charts';
import { View } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useState } from 'react';
import { verticalBarChartProps } from '@/components/presentation/stats/line-graph-props';
import { useFormatDate } from '@/hooks/useFormatDate';
import { Text } from 'react-native-paper';

export function StatisticBarChart<T>({
  statistics: { statistics, maxValue, minValue },
  axis,
}: {
  statistics: StatisticOverTime<T>;
  axis: QuantityAxis<T>;
}) {
  const formatDate = useFormatDate();
  const { colors } = useAppTheme();
  const charWidth = 5;
  const min = axis.toNumber(minValue);
  const points: barDataItem[] = statistics.map((stat): barDataItem => {
    const topLabelText = axis.format(stat.value);
    return {
      value: axis.toNumber(stat.value),
      barWidth: charWidth * (topLabelText.length + 3),
      topLabelComponent: () => (
        <Text style={{ width: 200, textAlign: 'center', pointerEvents: 'none' }}>{topLabelText}</Text>
      ),

      label: formatDate(stat.dateTime.toLocalDate(), {
        day: 'numeric',
        month: 'short',
      }),
    };
  });
  const [width, setWidth] = useState(0);
  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <BarChart
        {...verticalBarChartProps(colors, width)}
        negativeStepValue={min < 0 ? -0.2 * min : undefined!}
        overflowTop={30}
        frontColor={colors.primary + 'CC'}
        data={points}
        noOfSections={4}
        height={100}
        noOfSectionsBelowXAxis={min < 0 ? 5 : 0}
        showReferenceLine1
        referenceLine1Position={axis.toNumber(maxValue)}
      />
    </View>
  );
}
