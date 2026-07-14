import { OptionalStatisticOverTime } from '@/store/stats';
import { useCallback, useMemo, useState } from 'react';
import { usePreferredWeightUnit } from '@/hooks/usePreferredWeightUnit';
import { LineChart, lineDataItem } from 'react-native-gifted-charts';
import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { lineGraphProps } from '@/components/presentation/stats/line-graph-props';
import TouchableRipple from '@/components/presentation/foundation/gesture-wrappers/touchable-ripple';
import { DataPointCallout } from '@/components/presentation/stats/data-point-callout';
import { Text } from 'react-native-paper';
import { Weight } from '@/models/weight';
import { useFormatDate } from '@/hooks/useFormatDate';
import { useTranslate } from '@tolgee/react';

export function MultiSeriesWeightLineChart(props: { title?: string; series: OptionalStatisticOverTime<Weight>[] }) {
  const formatDate = useFormatDate();
  const weightUnit = usePreferredWeightUnit();
  const { colors } = useAppTheme();
  const { t } = useTranslate();
  const [focusedPoint, setFocusedPoint] = useState<{
    seriesIndex: number;
    pointIndex: number;
  } | null>(null);
  const [width, setWidth] = useState(0);
  // Only one exercise can be highlighted at a time - everything else stays muted in the background.
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

  const toggleHighlight = useCallback((index: number) => {
    setHighlightedIndex((previous) => {
      setFocusedPoint(null);
      return previous === index ? null : index;
    });
  }, []);
  // Only the highlighted exercise's dots are tappable, so tapping near an
  // overlapping muted line never reveals or highlights the wrong exercise.
  const points = useMemo<lineDataItem[][]>(() => {
    return props.series.map((series, seriesIndex) => {
      const isHighlightedSeries = seriesIndex === highlightedIndex;

      return series.statistics.map((stat, pointIndex): lineDataItem => {
        const label = formatDate(stat.dateTime.toLocalDate(), {
          day: 'numeric',
          month: 'short',
        });
        return {
          value: stat.value?.convertTo(weightUnit).value.toNumber()!,
          dataPointLabelComponent: isHighlightedSeries
            ? () =>
                focusedPoint?.seriesIndex === seriesIndex && focusedPoint.pointIndex === pointIndex ? (
                  <DataPointCallout label={label} value={stat.value?.shortLocaleFormat(2) ?? ''} />
                ) : null
            : undefined,
          onPress: isHighlightedSeries ? () => setFocusedPoint({ seriesIndex, pointIndex }) : undefined,
          label,
        };
      });
    });
  }, [props.series, highlightedIndex, focusedPoint, weightUnit, formatDate]);

  const legendItems = useMemo(() => {
    return props.series
      .map((series, index) => ({
        originalIndex: index,
        key: series.title ?? `Series ${index + 1}`,
        highlighted: highlightedIndex === index,
      }))
      .sort((a, b) => a.key.localeCompare(b.key));
  }, [props.series, highlightedIndex]);

  const orderedSeries = useMemo(() => {
    return points
      .map((data, index) => ({ data, index }))
      .sort((a, b) => {
        if (a.index === highlightedIndex) return 1;
        if (b.index === highlightedIndex) return -1;
        return 0;
      });
  }, [points, highlightedIndex]);

  if (props.series.length === 0) {
    return null;
  }

  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{ gap: spacing[2] }}
      testID="multi-series-weight-line-chart"
    >
      <Text variant="bodySmall" style={{ textAlign: 'center', color: colors.onSurfaceVariant }}>
        {t('stats.workout.exercise_progress.hint')}
      </Text>
      <LineChart
        dataSet={orderedSeries.map(({ data, index }) => {
          const isHighlighted = index === highlightedIndex;
          return {
            data,
            thickness: isHighlighted ? 4 : 1,
            color: isHighlighted ? colors.green : colors.outline,
            dataPointsColor: isHighlighted ? colors.green : colors.outline,
            dataPointsRadius: isHighlighted ? 4 : 2,
          };
        })}
        {...lineGraphProps(colors, width, Math.max(...points.map((x) => x.length), 0))}
        noOfSections={4}
        dataPointLabelWidth={70}
        // gifted-charts' own focus/strip system renders a full-height invisible
        // touch target per x-index (only for the last dataset), which can swallow
        // taps meant for a different series' dot. We drive our own per-dot
        // onPress/tooltip above, so the built-in focus overlay is unnecessary.
        focusEnabled={false}
      />
      <ScrollView
        testID="stats-legend"
        nestedScrollEnabled
        style={{ maxHeight: 260, marginTop: spacing[2] }}
        contentContainerStyle={{ flexDirection: 'column', gap: spacing[1] }}
      >
        {legendItems.map((item, i) => (
          <TouchableRipple
            key={item.key}
            onPress={() => toggleHighlight(item.originalIndex)}
            testID={`stats-legend-item-${i}`}
            style={{ borderRadius: spacing[2] }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                width: '100%',
                paddingVertical: spacing[2],
                paddingHorizontal: spacing[3],
                opacity: highlightedIndex === null || item.highlighted ? 1 : 0.5,
              }}
            >
              <View
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 7,
                  backgroundColor: item.highlighted ? colors.green : colors.outline,
                  borderColor: colors.outline,
                  marginRight: 6,
                }}
              />
              <Text
                style={{
                  color: colors.onSurface,
                  fontWeight: item.highlighted ? 'bold' : 'normal',
                }}
              >
                {item.key}
              </Text>
            </View>
          </TouchableRipple>
        ))}
      </ScrollView>
    </View>
  );
}
