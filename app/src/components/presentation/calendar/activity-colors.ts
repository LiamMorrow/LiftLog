import { AppThemeColors, ColorChoice } from '@/hooks/useAppTheme';
import { ActivityLevel } from '@/store/activity';
import { argbFromHex, Hct, hexFromArgb } from '@material/material-color-utilities';

/**
 * Tones for levels 1-4, walking from "barely there" to "full primary". Light and dark move in opposite
 * directions: on a light surface intensity reads as *darker*, on a dark surface as *brighter*.
 */
const LEVEL_TONES_LIGHT = [92, 80, 62, 45];
const LEVEL_TONES_DARK = [28, 40, 55, 72];

/** Text stays legible against the fill: mirrors the tone-inversion rule in `useAppTheme`'s `colorPair`. */
function onToneFor(tone: number): number {
  return tone > 60 ? 10 : 100;
}

export interface LevelColors {
  background: string;
  foreground: string;
}

export function levelColor(level: ActivityLevel, colors: AppThemeColors, isDark: boolean): LevelColors {
  if (level === 0) {
    return { background: 'transparent', foreground: colors.onSurfaceVariant };
  }

  const tones = isDark ? LEVEL_TONES_DARK : LEVEL_TONES_LIGHT;
  const tone = tones[level - 1]!;

  const primary = Hct.fromInt(argbFromHex(colors.primary));
  const fill = Hct.from(primary.hue, primary.chroma, tone);
  const text = Hct.from(primary.hue, primary.chroma, onToneFor(tone));

  return {
    background: hexFromArgb(fill.toInt()),
    foreground: hexFromArgb(text.toInt()),
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
