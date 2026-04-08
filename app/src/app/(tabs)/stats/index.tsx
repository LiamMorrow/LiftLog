import { ExerciseStatsContent } from '@/components/presentation/data/exercise-stats-content';
import { spacing } from '@/hooks/useAppTheme';
import { useTranslate } from '@tolgee/react';
import { Stack } from 'expo-router';

export default function StatsPage() {
  const { t } = useTranslate();

  return (
    <>
      <Stack.Screen
        options={{
          title: t('stats.statistics.title'),
        }}
      />
      <ExerciseStatsContent contentContainerStyle={{ gap: spacing[2] }} />
    </>
  );
}
