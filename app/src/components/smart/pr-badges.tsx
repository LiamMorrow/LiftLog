import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { rounding, spacing, useAppTheme } from '@/hooks/useAppTheme';
import { useAppSelector } from '@/store';
import { selectFeedPersonalRecords } from '@/store/activity';
import { PersonalRecord } from '@/store/stats/personal-records';
import { selectHistoryPersonalRecords } from '@/store/stored-sessions';
import { useTranslate } from '@tolgee/react';
import { View } from 'react-native';
import { Icon } from 'react-native-paper';

export function FeedPrBadges({ eventId }: { eventId: string }) {
  const records = useAppSelector(selectFeedPersonalRecords).get(eventId);

  // Only the 90-day feed window is knowable, so this can never claim to be an all-time best.
  return <PrBadges records={records} labelKey="feed.pr_badge.label" />;
}

export function HistoryPrBadges({ sessionId }: { sessionId: string }) {
  const records = useAppSelector(selectHistoryPersonalRecords).get(sessionId);

  return <PrBadges records={records} labelKey="history.pr_badge.label" />;
}

function PrBadges({
  records,
  labelKey,
}: {
  records: PersonalRecord[] | undefined;
  labelKey: 'feed.pr_badge.label' | 'history.pr_badge.label';
}) {
  const { t } = useTranslate();
  const { colors } = useAppTheme();

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
            {t(labelKey, { exercise: record.exerciseName })}
          </SurfaceText>
        </View>
      ))}
    </View>
  );
}
