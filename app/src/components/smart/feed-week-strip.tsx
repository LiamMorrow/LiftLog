import { ActivityCalendar } from '@/components/presentation/calendar/activity-calendar';
import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { spacing } from '@/hooks/useAppTheme';
import { useToday } from '@/hooks/useToday';
import { useAppSelector, useAppSelectorWithArg } from '@/store';
import { selectActivityWeek, selectStreakStats } from '@/store/activity';
import { useTranslate } from '@tolgee/react';
import { View } from 'react-native';
import { Card } from 'react-native-paper';

/** Beyond this the strip stops being a glance and starts being a list. */
const MAX_ROWS = 8;

export function FeedWeekStrip() {
  const { t } = useTranslate();
  const today = useToday();
  const firstDayOfWeek = useAppSelector((x) => x.settings.firstDayOfWeek);
  const rows = useAppSelectorWithArg(selectActivityWeek, today);
  const streak = useAppSelectorWithArg(selectStreakStats, today);
  const followsAnyone = useAppSelector((x) => Object.keys(x.feed.followedUsers).length > 0);

  if (!followsAnyone) {
    return null;
  }

  const [ownRow, ...friendRows] = rows;
  const visibleFriendRows = friendRows.slice(0, MAX_ROWS - 1);
  const overflow = friendRows.length - visibleFriendRows.length;

  const labelledRows = [
    { ...ownRow!, label: t('feed.you.label') },
    ...visibleFriendRows.map((row) => ({ ...row, label: row.label ?? t('feed.anonymous_user.label') })),
  ];

  return (
    <Card mode="contained" style={{ marginBottom: spacing[2] }}>
      <Card.Content style={{ gap: spacing[2] }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <SurfaceText font="text-lg" weight="bold">
            {t('feed.this_week.title')}
          </SurfaceText>
          {streak.state !== 'none' && (
            <SurfaceText font="text-sm" color="onSurfaceVariant">
              {streak.weeks + (streak.state === 'secured' ? 1 : 0) === 1
                ? t('stats.streak.weeks.one')
                : t('stats.streak.weeks.other', {
                    weeks: (streak.weeks + (streak.state === 'secured' ? 1 : 0)).toString(),
                  })}
            </SurfaceText>
          )}
        </View>

        <ActivityCalendar density="week" rows={labelledRows} firstDayOfWeek={firstDayOfWeek} />

        {overflow > 0 && (
          <SurfaceText font="text-sm" color="onSurfaceVariant">
            {t('feed.this_week.more_people', { count: overflow.toString() })}
          </SurfaceText>
        )}
      </Card.Content>
    </Card>
  );
}
