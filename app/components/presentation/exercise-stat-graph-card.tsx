import { ExerciseStatistics } from '@/store/stats';
import { useWeightSuffix } from '@/hooks/useWeightSuffix';
import { LineChart, lineDataItem } from 'react-native-gifted-charts';
import { View } from 'react-native';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { useState } from 'react';
import { SurfaceText } from '@/components/presentation/surface-text';
import { formatDate } from '@/utils/format-date';
import { lineGraphProps } from '@/components/presentation/line-graph-props';

export default function ExerciseStatGraphCard(props: {
  exerciseStats: ExerciseStatistics;
  title: string;
}) {
  const weightSuffix = useWeightSuffix();
  const { colors } = useAppTheme();
  const exercisePoints: lineDataItem[] =
    props.exerciseStats.statistics.statistics.map(
      (stat): lineDataItem => ({
        value: stat.value,
        dataPointText: formatNumber(stat.value) + weightSuffix,
        textShiftY: -10,
        label: formatDate(stat.dateTime.toLocalDate(), {
          day: 'numeric',
          month: 'short',
        }),
        dataPointColor: colors.primary,
      }),
    );
  const oneRepMaxPoints: lineDataItem[] =
    props.exerciseStats.oneRepMaxStatistics.statistics.map(
      (stat): lineDataItem => ({
        value: stat.value,
        textShiftY: -10,
        label: formatDate(stat.dateTime.toLocalDate(), {
          day: 'numeric',
          month: 'short',
        }),
        dataPointColor: colors.red,
        focusedDataPointLabelComponent: () => <SurfaceText>'HI'</SurfaceText>,
      }),
    );
  const [width, setWidth] = useState(0);
  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{ gap: spacing[2] }}
    >
      <SurfaceText font="text-2xl" style={{ textAlign: 'center' }}>
        {props.title}
      </SurfaceText>
      <LineChart
        areaChart
        data={oneRepMaxPoints}
        startFillColor={colors.primary}
        endFillColor={colors.primary}
        startOpacity={0.8}
        endOpacity={0.3}
        color1={colors.red}
        strokeDashArray1={[5, 10]}
        data2={exercisePoints}
        color2={colors.primary}
        strokeDashArray2={[1]}
        endOpacity1={0}
        startOpacity1={0}
        {...lineGraphProps(colors)}
        width={width}
      />
    </View>
  );
}

/**
 * Formats showing up to 2 decimal places
 * @param value
 */
function formatNumber(value: number) {
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}
