import { useEffect, useRef } from 'react';

/**
 * Runs `onDismiss` once, when the component goes away - for work that belongs to leaving a screen
 * rather than to a render: committing a draft, clearing state the next visit must not inherit,
 * cancelling something in flight.
 *
 * The callback is always the newest one, so it can close over current props and state without a
 * dependency array and without going stale. It runs on unmount only, never on a dependency change.
 */
export function useOnDismiss(onDismiss: () => void) {
  const latest = useRef(onDismiss);
  useEffect(() => {
    latest.current = onDismiss;
  });
  useEffect(() => () => latest.current(), []);
}
