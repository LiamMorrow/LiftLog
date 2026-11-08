import { AppThemeColors } from '@/hooks/useAppTheme';
import { ActivityLevel } from '@/store/activity';

export interface LevelColors {
  background: string;
  foreground: string;
}

/** The ramp itself is derived once, with the theme -- see `activityRamp` in `useAppTheme`. */
export function levelColor(level: ActivityLevel, colors: AppThemeColors): LevelColors {
  if (level === 0) {
    return { background: 'transparent', foreground: colors.onSurfaceVariant };
  }

  return {
    background: colors[`activityLevel${level}`],
    foreground: colors[`onActivityLevel${level}`],
  };
}
