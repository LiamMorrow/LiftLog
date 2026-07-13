import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { rounding, spacing, useAppTheme } from '@/hooks/useAppTheme';
import { useAppSelector } from '@/store';
import { selectFeedPersonalRecords } from '@/store/activity';
import { useTranslate } from '@tolgee/react';
import { View } from 'react-native';
import { Icon } from 'react-native-paper';

export function PrBadges({ eventId }: { eventId: string }) {
  const { t } = useTranslate();
  const { colors } = useAppTheme();
  const records = useAppSelector(selectFeedPersonalRecords).get(eventId);

  if (!records?.length) {
    return null;
  }

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[1] }}>
      {records.map((record) => (
        <View
          key={record.exerciseName}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing[1],
            paddingVertical: spacing[1],
            paddingHorizontal: spacing[2],
            borderRadius: rounding.roundedRectangleRadius,
            backgroundColor: colors.tertiaryContainer,
          }}
        >
          <Icon source="trendingUp" size={14} color={colors.onTertiaryContainer} />
          <SurfaceText font="text-xs" color="onTertiaryContainer">
            {/* Only the 90-day feed window is knowable, so this can never claim to be an all-time best. */}
            {t('feed.pr_badge.label', { exercise: record.exerciseName })}
          </SurfaceText>
        </View>
      ))}
    </View>
  );
}
