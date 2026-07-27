import { DayOfWeek, Instant } from '@js-joda/core';
import { match, P } from 'ts-pattern';

export type ColorSchemeSeed = 'default' | `#${string}`;

// A codec maps between a preference's runtime value and its on-disk string.
// `deserialize` returns undefined when the key is absent or unparseable, so the
// caller falls back to the descriptor default. `serialize` returns undefined to
// signal the key should be removed rather than written.
export interface Codec<T> {
  deserialize(raw: string | undefined): T | undefined;
  serialize(value: T): string | undefined;
}

// Booleans persist as 'True'/'False' — the casing is historical, don't change it.
export const boolCodec: Codec<boolean> = {
  deserialize: (raw) => (raw === undefined ? undefined : raw === 'True'),
  serialize: (value) => (value ? 'True' : 'False'),
};

export const intCodec: Codec<number> = {
  deserialize: (raw) => {
    const parsed = parseInt(raw ?? '', 10);
    return isNaN(parsed) ? undefined : parsed;
  },
  serialize: (value) => value.toString(),
};

export const stringCodec: Codec<string | undefined> = {
  deserialize: (raw) => raw,
  serialize: (value) => value,
};

export const colorSchemeSeedCodec: Codec<ColorSchemeSeed> = {
  deserialize: (raw) =>
    match(raw)
      .returnType<ColorSchemeSeed>()
      .with(P.string.regex(/^#[0-9a-fA-F]{6}$/), (v) => v as ColorSchemeSeed)
      .otherwise(() => 'default'),
  serialize: (value) => value,
};

export const dayOfWeekCodec: Codec<DayOfWeek> = {
  deserialize: (raw) =>
    match(raw?.toLowerCase())
      .with('sunday', () => DayOfWeek.SUNDAY)
      .with('monday', () => DayOfWeek.MONDAY)
      .with('tuesday', () => DayOfWeek.TUESDAY)
      .with('wednesday', () => DayOfWeek.WEDNESDAY)
      .with('thursday', () => DayOfWeek.THURSDAY)
      .with('friday', () => DayOfWeek.FRIDAY)
      .with('saturday', () => DayOfWeek.SATURDAY)
      .otherwise(() => undefined),
  serialize: (value) => value.name(),
};

export const instantCodec: Codec<Instant> = {
  deserialize: (raw) => {
    if (!raw) return undefined;
    try {
      return Instant.parse(raw);
    } catch {
      return undefined;
    }
  },
  serialize: (value) => value.toString(),
};
