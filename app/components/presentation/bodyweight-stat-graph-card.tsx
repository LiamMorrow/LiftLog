import { StatisticOverTime } from '@/store/stats';
import { usePreferredWeightUnit } from '@/hooks/usePreferredWeightUnit';
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
  const weightUnit = usePreferredWeightUnit();
  const { t } = useTranslate();
  const showBodyweight = useAppSelector((x) => x.settings.showBodyweight);
  const { colors } = useAppTheme();
  const points: lineDataItem[] = props.bodyweightStats.statistics.map(
    (stat): lineDataItem => ({
      value: stat.value.convertTo(weightUnit).value.toNumber(),
      dataPointText: stat.value.shortLocaleFormat(2),
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
        {t('exercise.bodyweight.label')}
      </SurfaceText>
      <LineChart
        color={colors.primary}
        data={points}
        strokeDashArray={[1]}
        yAxisOffset={
          props.bodyweightStats.minValue
            .convertTo(weightUnit)
            .value.toNumber() * 0.9
        }
        {...lineGraphProps(colors, width, points.length)}
      />
    </View>
  );
}
