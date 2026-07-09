import { describe, it, expect } from 'vitest';
import { Duration, OffsetDateTime, ZoneOffset } from '@js-joda/core';
import { RestTimer } from '@/models/session-models/rest-timer';

const start = OffsetDateTime.of(2025, 4, 5, 12, 0, 0, 0, ZoneOffset.UTC);

describe('RestTimer', () => {
  it('is not paused when created', () => {
    const timer = new RestTimer(start);
    expect(timer.isPaused).toBe(false);
    expect(timer.pausedAt).toBeUndefined();
  });

  it('counts elapsed time from the start while running', () => {
    const timer = new RestTimer(start);
    expect(timer.elapsed(start.plusSeconds(30))).toEqual(Duration.ofSeconds(30));
  });

  it('freezes elapsed time at the moment it was paused', () => {
    const timer = new RestTimer(start).pause(start.plusSeconds(30));
    expect(timer.isPaused).toBe(true);
    expect(timer.elapsed(start.plusSeconds(90))).toEqual(Duration.ofSeconds(30));
  });

  it('ignores a second pause', () => {
    const timer = new RestTimer(start).pause(start.plusSeconds(30));
    expect(timer.pause(start.plusSeconds(50))).toBe(timer);
  });

  it('resumes from the frozen elapsed time', () => {
    const timer = new RestTimer(start).pause(start.plusSeconds(30)).resume(start.plusSeconds(90));
    expect(timer.isPaused).toBe(false);
    expect(timer.elapsed(start.plusSeconds(100))).toEqual(Duration.ofSeconds(40));
  });

  it('does nothing when resuming a running timer', () => {
    const timer = new RestTimer(start);
    expect(timer.resume(start.plusSeconds(10))).toBe(timer);
  });

  it('togglePause pauses a running timer and resumes a paused one', () => {
    const running = new RestTimer(start);
    const paused = running.togglePause(start.plusSeconds(30));
    expect(paused.isPaused).toBe(true);
    expect(paused.togglePause(start.plusSeconds(90)).isPaused).toBe(false);
  });

  it('compares equal for the same start and paused state', () => {
    expect(new RestTimer(start).equals(new RestTimer(start))).toBe(true);
    expect(new RestTimer(start).pause(start).equals(new RestTimer(start))).toBe(false);
    expect(new RestTimer(start).equals(undefined)).toBe(false);
  });
});
