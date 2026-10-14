export interface Hsv {
  /** Hue in degrees, [0, 360). */
  h: number;
  /** Saturation, [0, 1]. */
  s: number;
  /** Value/brightness, [0, 1]. */
  v: number;
}

export type HexColor = `#${string}`;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function toHexByte(value: number): string {
  return clamp(Math.round(value), 0, 255).toString(16).padStart(2, '0').toUpperCase();
}

/** Convert HSV to an uppercase `#RRGGBB` string (satisfies the colorSchemeSeed codec). */
export function hsvToHex(h: number, s: number, v: number): HexColor {
  const hue = ((h % 360) + 360) % 360;
  const sat = clamp(s, 0, 1);
  const val = clamp(v, 0, 1);

  const c = val * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = val - c;

  let r = 0;
  let g = 0;
  let b = 0;
  if (hue < 60) [r, g, b] = [c, x, 0];
  else if (hue < 120) [r, g, b] = [x, c, 0];
  else if (hue < 180) [r, g, b] = [0, c, x];
  else if (hue < 240) [r, g, b] = [0, x, c];
  else if (hue < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  return `#${toHexByte((r + m) * 255)}${toHexByte((g + m) * 255)}${toHexByte((b + m) * 255)}`;
}

/** Parse a `#RRGGBB` string into HSV. Returns black for anything unparseable. */
export function hexToHsv(hex: string): Hsv {
  const match = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!match?.[1]) {
    return { h: 0, s: 0, v: 0 };
  }
  const int = parseInt(match[1], 16);
  const r = ((int >> 16) & 0xff) / 255;
  const g = ((int >> 8) & 0xff) / 255;
  const b = (int & 0xff) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  const s = max === 0 ? 0 : delta / max;
  return { h, s, v: max };
}
