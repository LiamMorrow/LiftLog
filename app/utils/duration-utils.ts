import { Duration } from '@js-joda/core';

/**
 * Extracts the hours, minutes, and seconds components from a Duration.
 * Each component is the "remaining" value after extracting higher units.
 */
export function getDurationComponents(duration: Duration): {
  hours: number;
  minutes: number;
  seconds: number;
} {
  const totalSeconds = duration.seconds();
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { hours, minutes, seconds };
}

/**
 * Creates a Duration from hours, minutes, and seconds components.
 * Supports overflow (e.g., 90 minutes becomes 1 hour 30 minutes).
 */
export function createDurationFromComponents(
  hours: number,
  minutes: number,
  seconds: number,
): Duration {
  return Duration.ofSeconds(hours * 3600 + minutes * 60 + seconds);
}

/**
 * Updates the hours component of a duration, preserving minutes and seconds.
 */
export function updateDurationHours(
  duration: Duration,
  newHours: number,
): Duration {
  const { minutes, seconds } = getDurationComponents(duration);
  return createDurationFromComponents(newHours, minutes, seconds);
}

/**
 * Updates the minutes component of a duration, preserving hours and seconds.
 * If minutes overflow (e.g., 90), the extra is added to hours.
 */
export function updateDurationMinutes(
  duration: Duration,
  newMinutes: number,
): Duration {
  const { hours, seconds } = getDurationComponents(duration);
  return createDurationFromComponents(hours, newMinutes, seconds);
}

/**
 * Updates the seconds component of a duration, preserving hours and minutes.
 * If seconds overflow (e.g., 90), the extra is added to minutes (and potentially hours).
 */
export function updateDurationSeconds(
  duration: Duration,
  newSeconds: number,
): Duration {
  const { hours, minutes } = getDurationComponents(duration);
  return createDurationFromComponents(hours, minutes, newSeconds);
}
