import { WeightedStatisticOverTime } from '@/store/stats';
import {
  usePreferredWeightSuffix,
  usePreferredWeightUnit,
} from '@/hooks/usePreferredWeightUnit';
import { LineChart, lineDataItem } from 'react-native-gifted-charts';
import { View } from 'react-native';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { useEffect, useState } from 'react';
import { lineGraphProps } from '@/components/presentation/stats/line-graph-props';
import { useFormatDate } from '@/hooks/useFormatDate';
import { Text } from 'react-native-paper';

export function WeightLineChart({
  statistics: { statistics, maxValue, minValue },
}: {
  statistics: WeightedStatisticOverTime;
}) {
  const formatDate = useFormatDate();
  const weightUnit = usePreferredWeightUnit();
  const { colors } = useAppTheme();
  const points: lineDataItem[] = statistics.map((stat): lineDataItem => {
    const value = stat.value.convertTo(weightUnit).value.toNumber();
    const label = formatDate(stat.dateTime.toLocalDate(), {
      day: 'numeric',
      month: 'short',
    });
    return {
      value,
      label,
      focusedDataPointLabelComponent: () => (
        <FocusedDatapointLabelComponent value={value} label={label} />
      ),
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
        negativeStepValue={
          minValue.value.lt(0)
            ? -0.2 * minValue.convertTo(weightUnit).value.toNumber()
            : undefined!
        }
        showFractionalValues={false}
        dataPointLabelWidth={70}
        showReferenceLine1
        areaChart={areaChart}
        delayBeforeUnFocus={10_000}
        referenceLine1Position={maxValue.convertTo(weightUnit).value.toNumber()}
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
        mostNegativeValue={
          minValue.value.lt(0)
            ? minValue.convertTo(weightUnit).value.toNumber()
            : undefined!
        }
        yAxisOffset={
          Math.floor(minValue.convertTo(weightUnit).value.toNumber()) - 10
        }
        noOfSectionsBelowXAxis={minValue.value.lt(0) ? 5 : 0}
      />
    </View>
  );
}

function FocusedDatapointLabelComponent(props: {
  value: number;
  label: string;
}) {
  const { colors } = useAppTheme();
  const weightSuffix = usePreferredWeightSuffix();
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
      <Text>
        {props.value.toFixed(0)}
        {weightSuffix}
      </Text>
    </View>
  );
}
