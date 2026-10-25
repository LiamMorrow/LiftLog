import { StreakStats } from '@/store/activity';
import { useTranslate } from '@tolgee/react';

export function useStreakCopy(stats: StreakStats) {
  const { t } = useTranslate();

  // The current week joins the run once you've trained in it.
  const weeks = stats.weeks + (stats.state === 'secured' ? 1 : 0);
  const hasStreak = stats.state !== 'none';
  const isSafe = stats.state === 'secured';

  const weeksLabel =
    weeks === 1 ? t('stats.streak.weeks.one') : t('stats.streak.weeks.other', { weeks: weeks.toString() });
  const safeLabel = t('stats.streak.safe.label');

  return {
    weeks,
    hasStreak,
    isSafe,
    safeLabel,
    title: hasStreak ? weeksLabel : t('stats.streak.start.title'),
    body: hasStreak ? t('stats.streak.keep.body') : t('stats.streak.start.body'),
    accessibilityLabel: !hasStreak ? t('stats.streak.none.label') : isSafe ? `${weeksLabel}, ${safeLabel}` : weeksLabel,
  };
}
