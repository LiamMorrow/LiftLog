import { fetchInboxItems } from '@/store/feed';
import { useFocusEffect } from 'expo-router';
import { useDispatch } from 'react-redux';

export const FEED_POLL_INTERVAL_MS = 60 * 1000;
/** Cheers stay on screen until dismissed, so they can wait for the feed's pace. Development polls faster to test them. */
export const CHEER_POLL_INTERVAL_MS = __DEV__ ? 15 * 1000 : FEED_POLL_INTERVAL_MS;

/** Live workouts and cheers arrive via a poll to inbox messages and fetching your feed items. */
export function useInboxPolling(
  enabled: boolean,
  { intervalMs = FEED_POLL_INTERVAL_MS, inboxOnly = false }: { intervalMs?: number; inboxOnly?: boolean } = {},
) {
  const dispatch = useDispatch();

  useFocusEffect(() => {
    if (!enabled) {
      return;
    }
    const poll = () => dispatch(fetchInboxItems({ fromUserAction: false, inboxOnly }));
    poll();
    const timer = setInterval(poll, intervalMs);
    return () => clearInterval(timer);
  });
}
