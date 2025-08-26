import { AppThemeColors } from '@/hooks/useAppTheme';
import { LineChartPropsType } from 'react-native-gifted-charts';

export const lineGraphProps = (colors: AppThemeColors): LineChartPropsType => ({
  focusEnabled: true,
  textColor: colors.onSurface,
  xAxisColor: colors.outline,
  yAxisColor: colors.outline,
  xAxisIndicesColor: colors.onSurface,
  yAxisIndicesColor: colors.onSurface,
  hideYAxisText: false,
  rulesColor: colors.onSurface,
  scrollToEnd: true,
  hideRules: true,
  xAxisLabelTextStyle: {
    color: colors.onSurface,
  },
  yAxisTextStyle: {
    color: colors.onSurface,
  },
});
