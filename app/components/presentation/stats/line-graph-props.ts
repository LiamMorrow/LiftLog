import { AppThemeColors } from '@/hooks/useAppTheme';
import {
  BarChartPropsType,
  CurveType,
  LineChartPropsType,
} from 'react-native-gifted-charts';

export const lineGraphProps = (
  colors: AppThemeColors,
  width: number,
  numberOfPoints: number,
): LineChartPropsType => {
  const calculatedSpacing =
    numberOfPoints > 1 ? width / (numberOfPoints - 1) - 50 / numberOfPoints : 1;
  const spacing = Math.max(calculatedSpacing, 50);
  return {
    focusEnabled: true,
    textColor: colors.onSurface,
    xAxisColor: 'transparent',
    yAxisColor: 'transparent',
    xAxisIndicesColor: colors.onSurface,
    yAxisIndicesColor: colors.onSurface,
    thickness: 3,
    curved: true,
    curveType: CurveType.CUBIC,
    curvature: 0.1,
    hideYAxisText: false,
    rulesColor: colors.outlineVariant,
    rulesLength: width - 30,
    rulesType: 'solid',
    hideRules: false,
    scrollToEnd: true,
    extrapolateMissingValues: false,
    width: width - 30,
    spacing,
    referenceLine1Config: {
      width: width - 30,
      color: colors.tertiary,
      labelTextStyle: { color: colors.onSurface },
    },
    xAxisLabelTextStyle: {
      color: colors.onSurface,
    },
    yAxisTextStyle: {
      color: colors.onSurface,
    },
  };
};

export const verticalBarChartProps = (
  colors: AppThemeColors,
  width: number,
): BarChartPropsType => {
  return {
    barBorderRadius: 2,
    xAxisColor: 'transparent',
    yAxisColor: 'transparent',
    xAxisIndicesColor: colors.onSurface,
    yAxisIndicesColor: colors.onSurface,
    hideYAxisText: false,
    rulesColor: colors.outlineVariant,
    rulesLength: width - 30,
    rulesType: 'solid',
    hideRules: false,
    scrollToEnd: true,
    width: width - 30,
    xAxisLabelTextStyle: {
      color: colors.onSurface,
    },
    referenceLine1Config: {
      width: width - 30,
      color: colors.tertiary,
      labelTextStyle: { color: colors.onSurface },
    },
    yAxisTextStyle: {
      color: colors.onSurface,
    },
  };
};

export const horizontalBarChartProps = (
  colors: AppThemeColors,
  width: number,
): BarChartPropsType => {
  return {
    barBorderRadius: 2,
    xAxisColor: 'transparent',
    yAxisColor: 'transparent',
    xAxisIndicesColor: colors.onSurface,
    horizontal: true,
    yAxisIndicesColor: colors.onSurface,
    hideYAxisText: false,
    rulesColor: colors.outlineVariant,
    rulesType: 'solid',
    hideRules: false,
    width: width - 70,
    xAxisLabelTextStyle: {
      color: colors.onSurface,
    },
    referenceLine1Config: {
      width: width - 30,
      color: colors.tertiary,
      labelTextStyle: { color: colors.onSurface },
    },
    yAxisTextStyle: {
      color: colors.onSurface,
    },
  };
};
