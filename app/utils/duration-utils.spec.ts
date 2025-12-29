import { Duration } from '@js-joda/core';
import { describe, it, expect } from 'vitest';
import {
  getDurationComponents,
  createDurationFromComponents,
  updateDurationHours,
  updateDurationMinutes,
  updateDurationSeconds,
} from './duration-utils';

describe('getDurationComponents', () => {
  it('should extract components from a simple duration', () => {
    const duration = Duration.ofSeconds(3661); // 1 hour, 1 minute, 1 second
    const result = getDurationComponents(duration);
    expect(result).toEqual({ hours: 1, minutes: 1, seconds: 1 });
  });

  it('should handle zero duration', () => {
    const duration = Duration.ZERO;
    const result = getDurationComponents(duration);
    expect(result).toEqual({ hours: 0, minutes: 0, seconds: 0 });
  });

  it('should handle hours only', () => {
    const duration = Duration.ofHours(2);
    const result = getDurationComponents(duration);
    expect(result).toEqual({ hours: 2, minutes: 0, seconds: 0 });
  });

  it('should handle minutes only', () => {
    const duration = Duration.ofMinutes(45);
    const result = getDurationComponents(duration);
    expect(result).toEqual({ hours: 0, minutes: 45, seconds: 0 });
  });
});

describe('createDurationFromComponents', () => {
  it('should create duration from components', () => {
    const duration = createDurationFromComponents(1, 30, 45);
    expect(duration.seconds()).toBe(5445); // 1*3600 + 30*60 + 45
  });

  it('should handle overflow in minutes', () => {
    const duration = createDurationFromComponents(1, 90, 0);
    // 1 hour + 90 minutes = 2 hours 30 minutes = 9000 seconds
    expect(duration.seconds()).toBe(9000);
  });

  it('should handle overflow in seconds', () => {
    const duration = createDurationFromComponents(0, 1, 90);
    // 1 minute + 90 seconds = 2 minutes 30 seconds = 150 seconds
    expect(duration.seconds()).toBe(150);
  });
});

describe('updateDurationHours', () => {
  it('should update hours while preserving minutes and seconds', () => {
    const original = Duration.ofSeconds(3661); // 1:01:01
    const updated = updateDurationHours(original, 2);
    const components = getDurationComponents(updated);
    expect(components).toEqual({ hours: 2, minutes: 1, seconds: 1 });
  });

  it('should set hours to zero while preserving other components', () => {
    const original = Duration.ofSeconds(3661); // 1:01:01
    const updated = updateDurationHours(original, 0);
    const components = getDurationComponents(updated);
    expect(components).toEqual({ hours: 0, minutes: 1, seconds: 1 });
  });
});

describe('updateDurationMinutes', () => {
  it('should update minutes while preserving hours and seconds', () => {
    const original = Duration.ofSeconds(3661); // 1:01:01
    const updated = updateDurationMinutes(original, 30);
    const components = getDurationComponents(updated);
    expect(components).toEqual({ hours: 1, minutes: 30, seconds: 1 });
  });

  it('should preserve hours when updating minutes - the main bug fix', () => {
    const original = Duration.ofHours(1); // 1:00:00
    const updated = updateDurationMinutes(original, 3);
    const components = getDurationComponents(updated);
    expect(components).toEqual({ hours: 1, minutes: 3, seconds: 0 });
  });

  it('should handle overflow in minutes by adding to hours', () => {
    const original = Duration.ofHours(1); // 1:00:00
    const updated = updateDurationMinutes(original, 90);
    const components = getDurationComponents(updated);
    // 1 hour + 90 minutes = 2 hours 30 minutes
    expect(components).toEqual({ hours: 2, minutes: 30, seconds: 0 });
  });
});

describe('updateDurationSeconds', () => {
  it('should update seconds while preserving hours and minutes', () => {
    const original = Duration.ofSeconds(3661); // 1:01:01
    const updated = updateDurationSeconds(original, 45);
    const components = getDurationComponents(updated);
    expect(components).toEqual({ hours: 1, minutes: 1, seconds: 45 });
  });

  it('should preserve hours and minutes when updating seconds - the main bug fix', () => {
    const original = Duration.ofSeconds(3660); // 1:01:00
    const updated = updateDurationSeconds(original, 30);
    const components = getDurationComponents(updated);
    expect(components).toEqual({ hours: 1, minutes: 1, seconds: 30 });
  });

  it('should handle overflow in seconds by adding to minutes', () => {
    const original = Duration.ofMinutes(1); // 0:01:00
    const updated = updateDurationSeconds(original, 90);
    const components = getDurationComponents(updated);
    // 1 minute + 90 seconds = 2 minutes 30 seconds
    expect(components).toEqual({ hours: 0, minutes: 2, seconds: 30 });
  });

  it('should handle overflow cascading to hours', () => {
    const original = Duration.ofMinutes(59); // 0:59:00
    const updated = updateDurationSeconds(original, 90);
    const components = getDurationComponents(updated);
    // 59 minutes + 90 seconds = 60 minutes 30 seconds = 1 hour 0 minutes 30 seconds
    expect(components).toEqual({ hours: 1, minutes: 0, seconds: 30 });
  });
});
