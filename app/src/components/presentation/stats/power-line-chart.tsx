import { NumericStatisticOverTime } from '@/store/stats';
import { LineChart, lineDataItem } from 'react-native-gifted-charts';
import { View } from 'react-native';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { useEffect, useState } from 'react';
import { lineGraphProps } from '@/components/presentation/stats/line-graph-props';
import { useFormatDate } from '@/hooks/useFormatDate';
import { Text } from 'react-native-paper';

export function PowerLineChart({
  statistics: { statistics, maxValue, minValue },
}: {
  statistics: NumericStatisticOverTime;
}) {
  const formatDate = useFormatDate();
  const { colors } = useAppTheme();
  const points: lineDataItem[] = statistics.map((stat): lineDataItem => {
    const label = formatDate(stat.dateTime.toLocalDate(), {
      day: 'numeric',
      month: 'short',
    });
    return {
      value: stat.value,
      label,
      focusedDataPointLabelComponent: () => <FocusedDatapointLabelComponent value={stat.value} label={label} />,
    };
  });
  const [width, setWidth] = useState(0);
  // On android the area chart renders poorly unless it is delayed until after initial render
  const [areaChart, setAreaChart] = useState(false);
  useEffect(() => {
    setAreaChart(!!width);
  }, [width]);
  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <LineChart
        {...lineGraphProps(colors, width, points.length)}
        showFractionalValues={false}
        dataPointLabelWidth={70}
        showReferenceLine1
        areaChart={areaChart}
        delayBeforeUnFocus={10_000}
        referenceLine1Position={maxValue}
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
        yAxisOffset={Math.max(Math.floor(minValue) - 10, 0)}
      />
    </View>
  );
}

function FocusedDatapointLabelComponent(props: { value: number; label: string }) {
  const { colors } = useAppTheme();
  return (
    <View
      style={{
        alignItems: 'center',
        paddingVertical: spacing[1],
        backgroundColor: colors.surface,
        borderRadius: 4,
        borderColor: colors.outline,
        borderStyle: 'solid',
        borderWidth: 1,
      }}
    >
      <Text>{props.label}</Text>
      <Text>{props.value.toFixed(0)} W</Text>
    </View>
  );
}
