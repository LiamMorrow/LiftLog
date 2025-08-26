import { AppThemeColors } from '@/hooks/useAppTheme';
import { CurveType, LineChartPropsType } from 'react-native-gifted-charts';

export const lineGraphProps = (
  colors: AppThemeColors,
  width: number,
  numberOfPoints: number,
): LineChartPropsType => {
  const calculatedSpacing =
    numberOfPoints > 1 ? width / (numberOfPoints - 1) - 50 : 1;
  const spacing = Math.max(calculatedSpacing, 30);
  return {
    focusEnabled: true,
    textColor: colors.onSurface,
    xAxisColor: colors.outline,
    yAxisColor: colors.outline,
    xAxisIndicesColor: colors.onSurface,
    yAxisIndicesColor: colors.onSurface,
    thickness: 3,
    curved: true,
    curveType: CurveType.CUBIC,
    curvature: 0.1,
    hideYAxisText: true,
    rulesColor: colors.onSurface,
    scrollToEnd: true,
    hideRules: true,
    extrapolateMissingValues: false,
    width,
    spacing,
    xAxisLabelTextStyle: {
      color: colors.onSurface,
    },
    yAxisTextStyle: {
      color: colors.onSurface,
    },
  };
};
