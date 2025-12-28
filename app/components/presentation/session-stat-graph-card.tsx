import { OptionalStatisticOverTime } from '@/store/stats';
import { usePreferredWeightUnit } from '@/hooks/usePreferredWeightUnit';
import { LineChart, lineDataItem } from 'react-native-gifted-charts';
import { View } from 'react-native';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { useState } from 'react';
import { SurfaceText } from '@/components/presentation/surface-text';
import { useTranslate } from '@tolgee/react';
import { lineGraphProps } from '@/components/presentation/line-graph-props';
import { Text } from 'react-native-paper';
import { Weight } from '@/models/weight';
import { useFormatDate } from '@/hooks/useFormatDate';

export default function SessionStatGraphCard(props: {
  sessionStats: OptionalStatisticOverTime<Weight>[];
}) {
  const formatDate = useFormatDate();
  const weightUnit = usePreferredWeightUnit();
  const { t } = useTranslate();
  const { colors } = useAppTheme();
  const pointColors = [
    colors.green,
    colors.red,
    colors.orange,
    colors.blue,
    colors.purple,
    colors.pink,
    colors.teal,
    colors.cyan,
    colors.brown,
    colors.indigo,
    colors.amber,
  ];
  const points: lineDataItem[][] = props.sessionStats.map((x) =>
    x.statistics.map(
      (stat): lineDataItem => ({
        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
        value: stat.value?.convertTo(weightUnit).value.toNumber()!,
        dataPointText: stat.value?.shortLocaleFormat(2) ?? '',
        textShiftY: -10,
        label: formatDate(stat.dateTime.toLocalDate(), {
          day: 'numeric',
          month: 'short',
        }),
      }),
    ),
  );
  const [width, setWidth] = useState(0);
  const legendItems = props.sessionStats.map((stat, i) => ({
    key: stat.title ?? `Series ${i + 1}`,
    color: pointColors[i % pointColors.length],
  }));
  if (!props.sessionStats.length) {
    return undefined;
  }
  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{ gap: spacing[2] }}
      testID="session-stat-card"
    >
      <SurfaceText font="text-2xl" style={{ textAlign: 'center' }}>
        {t('workout.sessions.title')}
      </SurfaceText>
      <LineChart
        dataSet={points.map((x, i) => ({
          data: x,
          color: pointColors[i % pointColors.length],
          dataPointsColor: pointColors[i % pointColors.length],
        }))}
        {...lineGraphProps(
          colors,
          width,
          Math.max(...points.map((x) => x.length)),
        )}
      />
      <View
        testID="stats-legend"
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: spacing[2],
          marginTop: spacing[2],
        }}
      >
        {legendItems.map((item, idx) => (
          <View
            key={item.key}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: spacing[2],
              marginBottom: spacing[1],
            }}
          >
            <View
              style={{
                width: 14,
                height: 14,
                borderRadius: 7,
                backgroundColor: item.color,
                borderColor: colors.outline,
                marginRight: 6,
              }}
            />
            <Text style={{ color: colors.onSurface }}>{item.key}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
