import { WeightedStatisticOverTime } from '@/store/stats';
import { usePreferredWeightUnit } from '@/hooks/usePreferredWeightUnit';
import { BarChart, barDataItem } from 'react-native-gifted-charts';
import { View } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useState } from 'react';
import { verticalBarChartProps } from '@/components/presentation/stats/line-graph-props';
import { useFormatDate } from '@/hooks/useFormatDate';
import { Text } from 'react-native-paper';

export function WeightBarChart({
  statistics: { statistics, maxValue, minValue },
}: {
  statistics: WeightedStatisticOverTime;
}) {
  const formatDate = useFormatDate();
  const weightUnit = usePreferredWeightUnit();
  const { colors } = useAppTheme();
  const charWidth = 5;
  const points: barDataItem[] = statistics.map((stat): barDataItem => {
    const topLabelText = stat.value.shortLocaleFormat(0);
    return {
      value: stat.value.convertTo(weightUnit).value.toNumber(),
      barWidth: charWidth * (topLabelText.length + 3),
      topLabelComponent: () => (
        <Text
          style={{ width: 200, textAlign: 'center', pointerEvents: 'none' }}
        >
          {topLabelText}
        </Text>
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
        negativeStepValue={
          minValue.value.lt(0)
            ? -0.2 * minValue.convertTo(weightUnit).value.toNumber()
            : undefined!
        }
        overflowTop={30}
        frontColor={colors.primary + 'CC'}
        data={points}
        noOfSections={4}
        height={100}
        noOfSectionsBelowXAxis={minValue.value.lt(0) ? 5 : 0}
        showReferenceLine1
        referenceLine1Position={maxValue.convertTo(weightUnit).value.toNumber()}
      />
    </View>
  );
}
