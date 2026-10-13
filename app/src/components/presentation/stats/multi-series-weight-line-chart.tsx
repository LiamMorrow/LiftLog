import { OptionalStatisticOverTime } from '@/store/stats';
import { useMemo, useState } from 'react';
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
  const [width, setWidth] = useState(0);

  const legendItems = useMemo(() => {
    return props.series
      .map((series, index) => ({ originalIndex: index, key: series.title ?? `Series ${index + 1}` }))
      .sort((a, b) => a.key.localeCompare(b.key));
  }, [props.series]);

  // Exactly one exercise is ever shown on the chart - default to the first alphabetically,
  // and tapping a legend entry switches which exercise that is.
  const [selectedIndex, setSelectedIndex] = useState(() => legendItems[0]?.originalIndex ?? 0);
  const activeIndex = selectedIndex < props.series.length ? selectedIndex : (legendItems[0]?.originalIndex ?? 0);
  const activeSeries = props.series[activeIndex];

  const points = useMemo<lineDataItem[]>(() => {
    if (!activeSeries) return [];
    return activeSeries.statistics.map((stat): lineDataItem => {
      const label = formatDate(stat.dateTime.toLocalDate(), {
        day: 'numeric',
        month: 'short',
      });
      return {
        value: stat.value?.convertTo(weightUnit).value.toNumber()!,
        label,
        focusedDataPointLabelComponent: () => (
          <DataPointCallout label={label} value={stat.value?.shortLocaleFormat(2) ?? ''} />
        ),
      };
    });
  }, [activeSeries, weightUnit, formatDate]);

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
        dataSet={[
          {
            data: points,
            thickness: 4,
            color: colors.green,
            dataPointsColor: colors.green,
            dataPointsRadius: 4,
          },
        ]}
        {...lineGraphProps(colors, width, points.length)}
        noOfSections={4}
        dataPointLabelWidth={70}
        showDataPointLabelOnFocus
        delayBeforeUnFocus={10_000}
      />
      <ScrollView
        testID="stats-legend"
        nestedScrollEnabled
        style={{ maxHeight: 260, marginTop: spacing[2] }}
        contentContainerStyle={{ flexDirection: 'column', gap: spacing[1] }}
      >
        {legendItems.map((item, i) => {
          const highlighted = item.originalIndex === activeIndex;
          return (
            <TouchableRipple
              key={item.key}
              onPress={() => setSelectedIndex(item.originalIndex)}
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
                  opacity: highlighted ? 1 : 0.5,
                }}
              >
                <View
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    backgroundColor: highlighted ? colors.green : colors.outline,
                    borderColor: colors.outline,
                    marginRight: 6,
                  }}
                />
                <Text
                  style={{
                    color: colors.onSurface,
                    fontWeight: highlighted ? 'bold' : 'normal',
                  }}
                >
                  {item.key}
                </Text>
              </View>
            </TouchableRipple>
          );
        })}
      </ScrollView>
    </View>
  );
}
