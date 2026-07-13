import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { StreakStats } from '@/store/activity';
import { useTranslate } from '@tolgee/react';
import { View } from 'react-native';
import { Card, Icon } from 'react-native-paper';

interface StreakCardProps {
  stats: StreakStats;
}

export function StreakCard({ stats }: StreakCardProps) {
  const { t } = useTranslate();
  const { colors } = useAppTheme();

  const hasHistory = stats.workoutsLast7Days > 0 || stats.weeks > 0 || stats.currentWeekCount > 0;
  if (!hasHistory) {
    return null;
  }

  // The current week counts towards the run only once it's actually met the target.
  const streakWeeks = stats.weeks + (stats.state === 'secured' ? 1 : 0);

  const streakLabel =
    streakWeeks === 1
      ? t('stats.streak.weeks.one')
      : t('stats.streak.weeks.other', { weeks: streakWeeks.toString() });

  return (
    <Card mode="contained">
      <Card.Content style={{ gap: spacing[2] }}>
        {stats.state !== 'none' && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
            <Icon source="localFireDepartment" size={24} color={colors.primary} />
            <SurfaceText font="text-lg" weight="bold">
              {streakLabel}
            </SurfaceText>
          </View>
        )}

        {stats.state === 'in_progress' && (
          <SurfaceText color="onSurfaceVariant">
            {stats.remainingThisWeek === 1
              ? t('stats.streak.keep_going.one', { weeks: stats.weeks.toString() })
              : t('stats.streak.keep_going.other', {
                  remaining: stats.remainingThisWeek.toString(),
                  weeks: stats.weeks.toString(),
                })}
          </SurfaceText>
        )}

        {stats.state === 'secured' && (
          <SurfaceText color="onSurfaceVariant">{t('stats.streak.secured.message')}</SurfaceText>
        )}

        <SurfaceText color="onSurfaceVariant">
          {stats.workoutsLast7Days === 1
            ? t('stats.last_7_days.one')
            : t('stats.last_7_days.other', { count: stats.workoutsLast7Days.toString() })}
        </SurfaceText>
      </Card.Content>
    </Card>
  );
}
