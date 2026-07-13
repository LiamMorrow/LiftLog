import { Duration } from '@js-joda/core';

export const formatTimeSpan = (duration: Duration): string => {
  const totalSeconds = duration.seconds();
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
