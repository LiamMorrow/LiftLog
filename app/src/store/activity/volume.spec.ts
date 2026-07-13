import { describe, expect, it } from 'vitest';
import { levelFor, volumeScaleOf } from '@/store/activity/volume';

describe('volumeScaleOf', () => {
  it('uses the 10th and 90th percentile, so one huge day does not wash out the rest', () => {
    const volumes = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100_000];

    const scale = volumeScaleOf(volumes);

    expect(scale.hi).toBeLessThan(100_000);
  });

  it('is degenerate for a single session', () => {
    const scale = volumeScaleOf([5000]);

    expect(scale.lo).toBe(5000);
    expect(scale.hi).toBe(5000);
  });

  it('is degenerate when every session is identical', () => {
    const scale = volumeScaleOf([5000, 5000, 5000]);

    expect(scale.hi).toBe(scale.lo);
  });

  it('handles an empty history', () => {
    expect(volumeScaleOf([])).toEqual({ lo: 0, hi: 0 });
  });
});

describe('levelFor', () => {
  const scale = { lo: 1000, hi: 5000 };

  it('grades a zero-volume (cardio-only) session as 1, never 0', () => {
    // 0 is reserved for "no session at all" — grading a cardio day 0 would tell the user they didn't train.
    expect(levelFor(0, scale)).toBe(1);
  });

  it('grades the bottom of the range as 1 and the top as the maximum', () => {
    expect(levelFor(1000, scale)).toBe(1);
    expect(levelFor(5000, scale)).toBe(4);
  });

  it('clamps volume above the 90th percentile rather than overflowing', () => {
    expect(levelFor(500_000, scale)).toBe(4);
  });

  it('grades the middle of the range in between', () => {
    const level = levelFor(3000, scale);

    expect(level).toBeGreaterThan(1);
    expect(level).toBeLessThan(4);
  });

  it('falls back to the middle level when there is no spread to grade against', () => {
    expect(levelFor(5000, { lo: 5000, hi: 5000 })).toBe(3);
    expect(levelFor(0, { lo: 0, hi: 0 })).toBe(3);
  });
});
