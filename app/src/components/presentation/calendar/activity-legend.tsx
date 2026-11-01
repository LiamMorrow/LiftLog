import { AppText } from '@/components/presentation/foundation/app-text';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { ACTIVITY_LEVELS } from '@/store/activity';
import { useTranslate } from '@tolgee/react';
import { View } from 'react-native';
import { levelColor } from '@/components/presentation/calendar/activity-colors';

const SWATCH_SIZE = 12;

/** A graded fill is unreadable without a key to grade it against. */
export function ActivityLegend() {
  const { t } = useTranslate();
  const { colors } = useAppTheme();

  const swatches = [colors.surfaceContainer, ...ACTIVITY_LEVELS.map((level) => levelColor(level, colors).background)];

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: spacing[1],
        marginTop: spacing[2],
      }}
    >
      <AppText variant="bodySmall" color="onSurfaceVariant" style={{ marginRight: spacing[0.5] }}>
        {t('history.calendar.legend.less.label')}
      </AppText>
      {swatches.map((color, index) => (
        <View
          key={index}
          style={{ width: SWATCH_SIZE, height: SWATCH_SIZE, borderRadius: 3, backgroundColor: color }}
        />
      ))}
      <AppText variant="bodySmall" color="onSurfaceVariant" style={{ marginLeft: spacing[0.5] }}>
        {t('history.calendar.legend.more.label')}
      </AppText>
    </View>
  );
}
