import { StreakPill } from '@/components/presentation/summary/streak-pill';
import { useAppSelector } from '@/store';
import { StreakStats } from '@/store/activity';
import { Stack } from 'expo-router';

/** A literal toolbar node, because the toolbar reads its children natively rather than rendering them. */
export function useStreakToolbarItem(stats: StreakStats | undefined) {
  const showAccomplishments = useAppSelector((x) => x.settings.showAccomplishments);

  return (
    <Stack.Toolbar.View hidden={!showAccomplishments || !stats?.hasHistory}>
      {stats ? <StreakPill stats={stats} /> : undefined}
    </Stack.Toolbar.View>
  );
}
