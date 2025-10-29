import { Duration } from '@js-joda/core';

// Function to format time in m:ss format
export function formatDuration(duration: Duration | undefined): string {
  if (!duration) {
    return '-:-:-';
  }
  const totalSeconds = Math.floor(duration.toMillis() / 1000);
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 60 / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
