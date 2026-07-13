import { AppThemeColors, ColorChoice } from '@/hooks/useAppTheme';
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

/**
 * The seed-harmonized accent colours, so a friend's dot always sits comfortably inside the user's theme --
 * whatever seed they picked.
 */
const MARKER_COLORS: ColorChoice[] = ['blue', 'orange', 'purple', 'teal', 'pink', 'amber', 'cyan', 'indigo'];

function hash(value: string): number {
  let result = 0;
  for (let i = 0; i < value.length; i++) {
    result = (result * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(result);
}

/** Deterministic per user, so the same person is the same colour on every day of the grid. */
export function markerColor(userId: string, colors: AppThemeColors): string {
  return colors[MARKER_COLORS[hash(userId) % MARKER_COLORS.length]!];
}
