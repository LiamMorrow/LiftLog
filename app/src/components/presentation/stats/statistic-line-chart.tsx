import { StatisticOverTime } from '@/store/stats';
import { QuantityAxis } from '@/components/presentation/stats/quantity-axis';
import { LineChart, lineDataItem } from 'react-native-gifted-charts';
import { View } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useEffect, useState } from 'react';
import { lineGraphProps } from '@/components/presentation/stats/line-graph-props';
import { DataPointCallout } from '@/components/presentation/stats/data-point-callout';
import { useFormatDate } from '@/hooks/useFormatDate';

export function StatisticLineChart<T>({
  statistics: { statistics, maxValue, minValue },
  axis,
}: {
  statistics: StatisticOverTime<T>;
  axis: QuantityAxis<T>;
}) {
  const formatDate = useFormatDate();
  const { colors } = useAppTheme();
  const max = axis.toNumber(maxValue);
  const min = axis.toNumber(minValue);
  const points: lineDataItem[] = statistics.map((stat): lineDataItem => {
    const value = axis.toNumber(stat.value);
    const label = formatDate(stat.dateTime.toLocalDate(), {
      day: 'numeric',
      month: 'short',
    });
    return {
      value,
      label,
      focusedDataPointLabelComponent: () => <DataPointCallout label={label} value={axis.formatNumber(value)} />,
    };
  });
  const [width, setWidth] = useState(0);
  // On android the area chart renders poorly unless it is delayed until after initial render
  const [areaChart, setAreaChart] = useState(false);
  useEffect(() => {
    setTimeout(() => setAreaChart(!!width), 0);
  }, [width, setAreaChart]);
  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <LineChart
        {...lineGraphProps(colors, width, points.length)}
        negativeStepValue={min < 0 ? -0.2 * min : undefined!}
        showFractionalValues={false}
        dataPointLabelWidth={70}
        showReferenceLine1
        areaChart={areaChart}
        delayBeforeUnFocus={10_000}
        referenceLine1Position={max}
        dataSet={[
          {
            data: points,
            strokeDashArray: [1],
            dataPointsColor: colors.primary,
            color: colors.primary,
            dataPointsRadius: 5,
            startFillColor: colors.primary,
            endFillColor: colors.primary,
            startOpacity: 0.1,
            endOpacity: 0.1,
          },
        ]}
        showDataPointLabelOnFocus
        noOfSections={4}
        height={100}
        mostNegativeValue={min < 0 ? min : undefined!}
        yAxisOffset={Math.floor(min) - 10}
        noOfSectionsBelowXAxis={min < 0 ? 5 : 0}
      />
    </View>
  );
}
