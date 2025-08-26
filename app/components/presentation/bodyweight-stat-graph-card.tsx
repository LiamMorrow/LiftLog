import { StatisticOverTime } from '@/store/stats';
import { useWeightSuffix } from '@/hooks/useWeightSuffix';
import { LineChart, lineDataItem } from 'react-native-gifted-charts';
import { View } from 'react-native';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { useState } from 'react';
import { SurfaceText } from '@/components/presentation/surface-text';
import { useTranslate } from '@tolgee/react';
import { useAppSelector } from '@/store';
import { lineGraphProps } from '@/components/presentation/line-graph-props';

export default function BodyweightStatGraphCard(props: {
  bodyweightStats: StatisticOverTime;
}) {
  const weightSuffix = useWeightSuffix();
  const { t } = useTranslate();
  const showBodyweight = useAppSelector((x) => x.settings.showBodyweight);
  const { colors } = useAppTheme();
  const points: lineDataItem[] = props.bodyweightStats.statistics.map(
    (stat): lineDataItem => ({
      value: stat.value!,
      dataPointText: formatNumber(stat.value) + weightSuffix,
      textShiftY: -10,
      dataPointColor: colors.primary,
    }),
  );
  const [width, setWidth] = useState(0);
  if (!showBodyweight || !props.bodyweightStats.statistics.length) {
    return undefined;
  }
  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{ gap: spacing[2] }}
      testID="bodyweight-stat-card"
    >
      <SurfaceText font="text-2xl" style={{ textAlign: 'center' }}>
        {t('Bodyweight')}
      </SurfaceText>
      <LineChart
        color={colors.primary}
        data={points}
        strokeDashArray={[1]}
        yAxisOffset={props.bodyweightStats.minValue * 0.9}
        {...lineGraphProps(colors, width, points.length)}
      />
    </View>
  );
}

/**
 * Formats showing up to 2 decimal places
 * @param value
 */
function formatNumber(value: number | undefined) {
  return value?.toLocaleString(undefined, { maximumFractionDigits: 2 });
}
