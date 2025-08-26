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
        value: stat.value!,
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
        value: stat.value!,
        textShiftY: -10,
        label: formatDate(stat.dateTime.toLocalDate(), {
          day: 'numeric',
          month: 'short',
        }),
        dataPointColor: colors.red,
        dataPointText: formatNumber(stat.value) + weightSuffix,
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
        data={oneRepMaxPoints}
        color1={colors.red}
        strokeDashArray1={[5, 10]}
        data2={exercisePoints}
        color2={colors.primary}
        strokeDashArray2={[1]}
        {...lineGraphProps(colors, width, exercisePoints.length)}
        negativeStepValue={
          props.exerciseStats.oneRepMaxStatistics.minValue < 0
            ? -0.2 * props.exerciseStats.oneRepMaxStatistics.minValue
            : undefined!
        }
        mostNegativeValue={
          props.exerciseStats.oneRepMaxStatistics.minValue < 0
            ? props.exerciseStats.oneRepMaxStatistics.minValue
            : undefined!
        }
        noOfSectionsBelowXAxis={
          props.exerciseStats.oneRepMaxStatistics.minValue < 0 ? 5 : 0
        }
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
