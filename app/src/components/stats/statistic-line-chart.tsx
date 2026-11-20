import { StatisticOverTime } from '@/store/stats';
import { QuantityAxis } from '@/components/stats/quantity-axis';
import { LineChart, lineDataItem } from 'react-native-gifted-charts';
import { View } from 'react-native';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { useEffect, useState } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { lineGraphProps } from '@/components/stats/line-graph-props';
import { useFormatDate } from '@/hooks/useFormatDate';
import { AppText } from '@/components/foundation/app-text';

const fittedEdgeSpacing = 34;
const fittedLabelWidth = 64;
const zoomedMaxSpacing = 80;

export function StatisticLineChart<T>({
  statistics: { statistics, maxValue, minValue },
  axis,
  fitToWidth,
}: {
  statistics: StatisticOverTime<T>;
  axis: QuantityAxis<T>;
  fitToWidth?: boolean;
}) {
  const formatDate = useFormatDate();
  const { colors } = useAppTheme();
  const [width, setWidth] = useState(0);
  const max = axis.toNumber(maxValue);
  const min = axis.toNumber(minValue);
  const [zoom, setZoom] = useState(1);
  const unzoomedSpacing =
    statistics.length > 1 ? (width - 30 - 2 * fittedEdgeSpacing) / (statistics.length - 1) : fittedEdgeSpacing;
  const fittedSpacing = unzoomedSpacing * zoom;
  const maxZoom = Math.max(1, zoomedMaxSpacing / unzoomedSpacing);
  const pinch = Gesture.Pinch()
    .enabled(!!fitToWidth)
    .runOnJS(true)
    .onChange((e) => setZoom((z) => Math.min(Math.max(z * e.scaleChange, 1), maxZoom)));
  const labelEvery = Math.ceil(fittedLabelWidth / fittedSpacing);
  const points: lineDataItem[] = statistics.map((stat, index): lineDataItem => {
    const value = axis.toNumber(stat.value);
    const label = formatDate(stat.dateTime.toLocalDate(), {
      day: 'numeric',
      month: 'short',
    });
    const showLabel = (statistics.length - 1 - index) % labelEvery === 0;
    return {
      value,
      label,
      ...(fitToWidth && {
        labelComponent: () => (
          <View style={{ width: fittedLabelWidth, marginLeft: (fittedSpacing - fittedLabelWidth) / 2 }}>
            <AppText style={{ textAlign: 'center' }}>{showLabel && label}</AppText>
          </View>
        ),
      }),
      focusedDataPointLabelComponent: () => (
        <FocusedDatapointLabelComponent value={axis.formatNumber(value)} label={label} />
      ),
    };
  });
  // On android the area chart renders poorly unless it is delayed until after initial render
  const [areaChart, setAreaChart] = useState(false);
  useEffect(() => {
    setTimeout(() => setAreaChart(!!width), 0);
  }, [width, setAreaChart]);
  return (
    <GestureDetector gesture={pinch}>
      <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        <LineChart
          {...lineGraphProps(colors, width, points.length)}
          {...(fitToWidth && {
            spacing: fittedSpacing,
            initialSpacing: fittedEdgeSpacing,
            endSpacing: fittedEdgeSpacing,
            disableScroll: zoom === 1,
            scrollToEnd: zoom > 1,
          })}
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
    </GestureDetector>
  );
}

function FocusedDatapointLabelComponent(props: { value: string; label: string }) {
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
      <AppText>{props.label}</AppText>
      <AppText>{props.value}</AppText>
    </View>
  );
}
