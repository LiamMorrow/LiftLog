import { Card } from 'react-native-paper';
import { ExerciseStatistics } from '@/store/stats';
import { useWeightSuffix } from '@/hooks/useWeightSuffix';
import { LineChart, lineDataItem } from 'react-native-gifted-charts';
import { View } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useState } from 'react';

export default function StatGraphCard(props: {
  exerciseStats: ExerciseStatistics;
  title: string;
}) {
  const weightSuffix = useWeightSuffix();
  const { colors } = useAppTheme();
  const exercisePoints: lineDataItem[] =
    props.exerciseStats.statistics.statistics.map(
      (stat): lineDataItem => ({
        value: stat.value,
        label: stat.dateTime.toString(),
        dataPointText: stat.value.toString(),
        dataPointColor: colors.primary,
      }),
    );
  const oneRepMaxPoints: lineDataItem[] =
    props.exerciseStats.oneRepMaxStatistics.statistics.map(
      (stat): lineDataItem => ({
        value: stat.value,
        label: stat.dateTime.toString(),
        dataPointText: Math.floor(stat.value).toString(),
        dataPointColor: colors.red,
      }),
    );
  const [width, setWidth] = useState(100);
  return (
    <Card>
      <Card.Title title={props.title} titleVariant="headlineSmall" />
      <Card.Content
        style={{ height: 300 }}
        onLayout={(event) => setWidth(event.nativeEvent.layout.height)}
      >
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
          focusEnabled
          textColor={colors.onSurface}
          xAxisColor={colors.outline}
          yAxisColor={colors.outline}
          xAxisIndicesColor={colors.onSurface}
          yAxisIndicesColor={colors.onSurface}
          rulesColor={colors.onSurface}
          noOfSections={4}
          scrollToEnd
          xAxisLabelTextStyle={{
            color: colors.onSurface,
          }}
          yAxisTextStyle={{
            color: colors.onSurface,
          }}
          width={width}
        />
      </Card.Content>
    </Card>
  );
}
const customDataPoint = () => {
  return (
    <View
      style={{
        width: 20,
        height: 20,
        backgroundColor: 'white',
        borderWidth: 4,
        borderRadius: 10,
        borderColor: '#07BAD1',
      }}
    />
  );
};
