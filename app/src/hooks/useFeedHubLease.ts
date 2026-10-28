import { acquireFeedHubLease, releaseFeedHubLease } from '@/store/feed';
import type { FeedHubLease } from '@/services/feed-hub-service';
import { useFocusEffect } from 'expo-router';
import { AppState } from 'react-native';
import { useDispatch } from 'react-redux';

/** Keeps the feed hub connected while this screen is focused and the app is in the foreground. */
export function useFeedHubLease(kind: FeedHubLease, enabled: boolean) {
  const dispatch = useDispatch();

  useFocusEffect(() => {
    if (!enabled) {
      return;
    }
    let held = false;
    const hold = () => {
      if (!held) {
        held = true;
        dispatch(acquireFeedHubLease(kind));
      }
    };
    const drop = () => {
      if (held) {
        held = false;
        dispatch(releaseFeedHubLease(kind));
      }
    };
    if (AppState.currentState === 'active') {
      hold();
    }
    const subscription = AppState.addEventListener('change', (state) => (state === 'active' ? hold() : drop()));
    return () => {
      subscription.remove();
      drop();
    };
  });
}
