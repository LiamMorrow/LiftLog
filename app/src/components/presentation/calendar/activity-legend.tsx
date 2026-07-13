import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { ACTIVITY_LEVELS } from '@/store/activity';
import { useTranslate } from '@tolgee/react';
import { View } from 'react-native';
import { levelColor } from '@/components/presentation/calendar/activity-colors';

const SWATCH_SIZE = 12;
const DOT_SIZE = 6;

/** A graded fill is unreadable without a key to grade it against. */
export function ActivityLegend({ showFriends }: { showFriends: boolean }) {
  const { t } = useTranslate();
  const { colors } = useAppTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: spacing[4],
        marginTop: spacing[3],
        paddingTop: spacing[3],
        borderTopWidth: 1,
        borderTopColor: colors.outlineVariant,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[1] }}>
        {ACTIVITY_LEVELS.map((level) => (
          <View
            key={level}
            style={{
              width: SWATCH_SIZE,
              height: SWATCH_SIZE,
              borderRadius: 3,
              backgroundColor: levelColor(level, colors).background,
            }}
          />
        ))}
        <SurfaceText font="text-xs" color="onSurfaceVariant" style={{ marginLeft: spacing[1] }}>
          {t('history.calendar.legend.volume')}
        </SurfaceText>
      </View>

      {showFriends && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[1] }}>
          <View style={{ width: DOT_SIZE, height: DOT_SIZE, borderRadius: 1000, backgroundColor: colors.teal }} />
          <View style={{ width: DOT_SIZE, height: DOT_SIZE, borderRadius: 1000, backgroundColor: colors.orange }} />
          <SurfaceText font="text-xs" color="onSurfaceVariant">
            {t('history.calendar.legend.friends')}
          </SurfaceText>
        </View>
      )}
    </View>
  );
}
