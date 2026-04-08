import Icon from '@/components/presentation/foundation/gesture-wrappers/icon';
import { AppIconSource } from '@/components/presentation/foundation/ms-icon-source';
import { lineGraphProps } from '@/components/presentation/stats/line-graph-props';
import { font, spacing, useAppTheme } from '@/hooks/useAppTheme';
import { useFormatDate } from '@/hooks/useFormatDate';
import { Distance } from '@/models/blueprint-models';
import { WeightUnit } from '@/models/weight';
import {
  formatPersonalBestValue,
  PersonalBestCategoryId,
  PersonalBestCategorySummary,
  PersonalBestValue,
} from '@/utils/personal-bests';
import { useTranslate } from '@tolgee/react';
import { lineDataItem, LineChart } from 'react-native-gifted-charts';
import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { Card, Text } from 'react-native-paper';

export function PersonalBestCategoryBadge({
  categoryId,
  size = 40,
}: {
  categoryId: PersonalBestCategoryId;
  size?: number;
}) {
  const { colors } = useAppTheme();

  return (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: colors.surfaceContainerHighest,
        borderColor: colors.outlineVariant,
        borderWidth: 1,
        borderRadius: Math.round(size / 2),
        height: size,
        justifyContent: 'center',
        width: size,
      }}
    >
      <Icon
        color={colors.primary}
        size={Math.round(size * 0.5)}
        source={getPersonalBestCategoryIcon(categoryId)}
      />
    </View>
  );
}

export function PersonalBestTrendChart({
  category,
  preferredUnit,
}: {
  category: PersonalBestCategorySummary;
  preferredUnit: WeightUnit;
}) {
  const formatDate = useFormatDate();
  const { colors } = useAppTheme();
  const { t } = useTranslate();
  const [width, setWidth] = useState(0);
  const [areaChart, setAreaChart] = useState(false);
  const measure = useMemo(
    () => getChartMeasure(category.history, preferredUnit, t),
    [category.history, preferredUnit, t],
  );

  useEffect(() => {
    setAreaChart(!!width);
  }, [width]);

  if (category.history.length < 2) {
    return (
      <Card
        mode="contained"
        style={{ backgroundColor: colors.surfaceContainerHighest }}
      >
        <Card.Content style={{ gap: spacing[2] }}>
          <Text variant="titleMedium">{measure.title}</Text>
          <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
            {measure.singlePointLabel}
          </Text>
        </Card.Content>
      </Card>
    );
  }

  const points: lineDataItem[] = category.history.map((record) => {
    const value = getChartValue(
      record.value,
      preferredUnit,
      measure.distanceUnit,
    );
    const label = formatDate(record.achievedOn, {
      day: 'numeric',
      month: 'short',
    });

    return {
      value,
      label,
      focusedDataPointLabelComponent: () => (
        <FocusedRecordPoint
          label={label}
          value={formatPersonalBestValue(record.value)}
        />
      ),
    };
  });

  const yValues = points.map((point) => point.value ?? 0);
  const maxValue = Math.max(...yValues);
  const minValue = Math.min(...yValues);
  const offset = minValue > 0 ? Math.max(Math.floor(minValue * 0.95), 0) : 0;

  return (
    <Card
      mode="contained"
      style={{ backgroundColor: colors.surfaceContainerHighest }}
    >
      <Card.Content style={{ gap: spacing[3], paddingVertical: spacing[6] }}>
        <View style={{ gap: spacing[1] }}>
          <Text variant="titleMedium">{measure.title}</Text>
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
            {measure.subtitle}
          </Text>
        </View>
        <View onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
          <LineChart
            {...lineGraphProps(colors, width, points.length)}
            areaChart={areaChart}
            color={colors.primary}
            dataPointsColor={colors.primary}
            dataPointsRadius={5}
            dataSet={[
              {
                color: colors.primary,
                data: points,
                dataPointsColor: colors.primary,
                dataPointsRadius: 5,
                endFillColor: colors.primary,
                endOpacity: 0.08,
                startFillColor: colors.primary,
                startOpacity: 0.16,
              },
            ]}
            delayBeforeUnFocus={10_000}
            height={140}
            noOfSections={4}
            showDataPointLabelOnFocus
            showFractionalValues={measure.showFractionalValues}
            yAxisLabelSuffix={measure.axisSuffix}
            yAxisOffset={offset}
            dataPointLabelWidth={100}
            referenceLine1Position={maxValue}
            showReferenceLine1
          />
        </View>
      </Card.Content>
    </Card>
  );
}

export function getPersonalBestCategoryIcon(
  categoryId: PersonalBestCategoryId,
): AppIconSource {
  switch (categoryId) {
    case 'max-weight':
      return 'fitnessCenter';
    case 'estimated-1rm':
      return 'function';
    case 'session-volume':
      return 'anchor';
    case 'reps-at-weight':
      return 'barChart';
    case 'longest-duration':
      return 'timer';
    case 'longest-distance':
      return 'trailLength';
  }
}

interface ChartMeasure {
  axisSuffix: string;
  distanceUnit: Distance['unit'] | undefined;
  showFractionalValues: boolean;
  singlePointLabel: string;
  subtitle: string;
  title: string;
}

function getChartMeasure(
  history: PersonalBestCategorySummary['history'],
  preferredUnit: WeightUnit,
  t: ReturnType<typeof useTranslate>['t'],
): ChartMeasure {
  const currentValue = history.at(-1)?.value;
  if (!currentValue) {
    return {
      axisSuffix: '',
      distanceUnit: undefined as Distance['unit'] | undefined,
      showFractionalValues: false,
      singlePointLabel: '',
      subtitle: '',
      title: '',
    };
  }

  switch (currentValue.kind) {
    case 'weight':
      return {
        axisSuffix: preferredUnit === 'kilograms' ? 'kg' : 'lb',
        distanceUnit: undefined,
        showFractionalValues: false,
        singlePointLabel: formatPersonalBestValue(currentValue),
        subtitle: t('progress.pbs.detail.chart.weight.subtitle'),
        title: t('progress.pbs.detail.chart.weight.title'),
      };
    case 'volume':
      return {
        axisSuffix: preferredUnit === 'kilograms' ? 'kg' : 'lb',
        distanceUnit: undefined,
        showFractionalValues: false,
        singlePointLabel: formatPersonalBestValue(currentValue),
        subtitle: t('progress.pbs.detail.chart.volume.subtitle'),
        title: t('progress.pbs.detail.chart.volume.title'),
      };
    case 'reps-at-weight':
      return {
        axisSuffix: ' reps',
        distanceUnit: undefined,
        showFractionalValues: false,
        singlePointLabel: formatPersonalBestValue(currentValue),
        subtitle: t('progress.pbs.detail.chart.reps.subtitle'),
        title: t('progress.pbs.detail.chart.reps.title'),
      };
    case 'duration':
      return {
        axisSuffix: ' min',
        distanceUnit: undefined,
        showFractionalValues: false,
        singlePointLabel: formatPersonalBestValue(currentValue),
        subtitle: t('progress.pbs.detail.chart.duration.subtitle'),
        title: t('progress.pbs.detail.chart.duration.title'),
      };
    case 'distance': {
      const distanceHistory = history
        .map((record) => record.value)
        .filter(
          (value): value is Extract<PersonalBestValue, { kind: 'distance' }> =>
            value.kind === 'distance',
        );
      const maxMetres = Math.max(
        ...distanceHistory.map((value) => toMetres(value.distance)),
      );
      const distanceUnit = maxMetres >= 1000 ? 'kilometre' : 'metre';
      return {
        axisSuffix: distanceUnit === 'kilometre' ? 'km' : 'm',
        distanceUnit,
        showFractionalValues: distanceUnit === 'kilometre',
        singlePointLabel: formatPersonalBestValue(currentValue),
        subtitle: t('progress.pbs.detail.chart.distance.subtitle'),
        title: t('progress.pbs.detail.chart.distance.title'),
      };
    }
  }
}

function getChartValue(
  value: PersonalBestValue,
  preferredUnit: WeightUnit,
  distanceUnit?: ChartMeasure['distanceUnit'],
) {
  switch (value.kind) {
    case 'weight':
    case 'volume':
      return value.weight.convertTo(preferredUnit).value.toNumber();
    case 'reps-at-weight':
      return value.reps;
    case 'duration':
      return value.duration.toMinutes();
    case 'distance':
      return convertDistanceForChart(value.distance, distanceUnit);
  }
}

function convertDistanceForChart(
  distance: Distance,
  unit: Distance['unit'] = 'metre',
) {
  const metres = toMetres(distance);
  switch (unit) {
    case 'kilometre':
      return metres / 1000;
    case 'mile':
      return metres / 1609.344;
    case 'yard':
      return metres / 0.9144;
    case 'metre':
      return metres;
  }
}

function toMetres(distance: Distance) {
  switch (distance.unit) {
    case 'metre':
      return distance.value.toNumber();
    case 'kilometre':
      return distance.value.multipliedBy(1000).toNumber();
    case 'mile':
      return distance.value.multipliedBy(1609.344).toNumber();
    case 'yard':
      return distance.value.multipliedBy(0.9144).toNumber();
  }
}

function FocusedRecordPoint({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const { colors } = useAppTheme();

  return (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderColor: colors.outline,
        borderRadius: 8,
        borderWidth: 1,
        gap: spacing[0.5],
        paddingHorizontal: spacing[2],
        paddingVertical: spacing[1],
      }}
    >
      <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
        {label}
      </Text>
      <Text style={[font['text-sm'], { fontWeight: '700' }]}>{value}</Text>
    </View>
  );
}
