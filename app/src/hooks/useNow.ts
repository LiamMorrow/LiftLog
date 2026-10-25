import { Instant } from '@js-joda/core';
import { useEffect, useState } from 'react';

export function useNow(intervalMs: number): Instant {
  const [now, setNow] = useState(() => Instant.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Instant.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
}
