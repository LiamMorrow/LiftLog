import { Instant } from '@js-joda/core';
import { AddEffectFn, RootState } from '@/store/store';
import {
  acquireFeedHubLease,
  clearFeedState,
  feedHubConnected,
  fetchFeedItems,
  fetchInboxItems,
  inboxNudged,
  liveFrameEnded,
  liveFrameReceived,
  putFriends,
  releaseFeedHubLease,
  removeFriends,
  removeLiveSession,
  selectAcceptedFriends,
  setIdentity,
  setLiveSessions,
  upsertLiveSession,
  watchLiveSessions,
} from '@/store/feed';
import {
  clearBackendAssignment,
  putBackend,
  removeBackend,
  setBackendAssignment,
  setBackendAssignments,
  setBackends,
  setBackendsHydrated,
} from '@/store/backends';
import { removeFriendsWithInvalidSecrets, toFeedItemAsync } from '@/store/feed/feed-items-effects';
import { publishActiveSessionLive } from '@/store/feed/live-session-effects';
import { LiveSessionUserEvent } from '@/models/feed-models';
import { LiveFrameResponse } from '@/models/feed-api-models';
import { EncryptionService } from '@/services/encryption-service';

/** A burst of cheers arrives as a burst of nudges, which one inbox fetch can answer. */
export const INBOX_NUDGE_COALESCE_MS = 500;

export function addFeedHubEffects(addEffect: AddEffectFn) {
  addEffect(acquireFeedHubLease, async (action, { dispatch, getState, extra }) => {
    extra.feedHubService.acquire(action.payload);
    if (action.payload === 'viewer') {
      dispatch(watchLiveSessions());
    } else {
      await publishActiveSessionLive(getState, extra);
    }
  });

  addEffect(releaseFeedHubLease, async (action, { extra: { feedHubService } }) => {
    feedHubService.release(action.payload);
    if (action.payload === 'viewer' && !feedHubService.hasLease('viewer')) {
      await feedHubService.watch([]);
    }
  });

  addEffect(
    [
      setIdentity,
      clearFeedState,
      setBackends,
      setBackendAssignments,
      setBackendAssignment,
      clearBackendAssignment,
      putBackend,
      removeBackend,
      setBackendsHydrated,
    ],
    (_, { extra: { feedHubService } }) => feedHubService.sync(),
  );

  addEffect(feedHubConnected, async (_, { dispatch, getState, extra }) => {
    if (extra.feedHubService.hasLease('viewer')) {
      dispatch(watchLiveSessions());
    }
    dispatch(fetchInboxItems({ fromUserAction: false, inboxOnly: true }));
    await publishActiveSessionLive(getState, extra);
  });

  addEffect([putFriends, removeFriends], (_, { dispatch, extra: { feedHubService } }) => {
    if (feedHubService.hasLease('viewer')) {
      dispatch(watchLiveSessions());
    }
  });

  addEffect(
    watchLiveSessions,
    async (_, { dispatch, getState, signal, cancelActiveListeners, extra: { feedHubService, encryptionService } }) => {
      cancelActiveListeners();
      const friends = selectAcceptedFriends(getState()).filter((x) => x.theirSecret && x.theirKeys.length);
      const response = await feedHubService.watch(friends.map((x) => x.theirSecret!));
      if (!response || signal.aborted) {
        return;
      }
      removeFriendsWithInvalidSecrets(new Set(response.invalidFollowSecrets), dispatch, getState);
      const sessions = await Promise.all(
        response.frames.map((frame) => decryptLiveFrameAsync(frame, getState, encryptionService)),
      );
      if (!signal.aborted) {
        dispatch(setLiveSessions(sessions.filter((x) => x !== undefined)));
      }
    },
  );

  addEffect(liveFrameReceived, async (action, { dispatch, getState, extra: { encryptionService } }) => {
    const session = await decryptLiveFrameAsync(action.payload, getState, encryptionService);
    if (session) {
      dispatch(upsertLiveSession(session));
    }
  });

  addEffect(liveFrameEnded, (action, { dispatch }) => {
    dispatch(removeLiveSession(action.payload));
    dispatch(fetchFeedItems({ fromUserAction: false }));
  });

  addEffect(inboxNudged, async (_, { dispatch, signal, cancelActiveListeners }) => {
    cancelActiveListeners();
    await new Promise((resolve) => setTimeout(resolve, INBOX_NUDGE_COALESCE_MS));
    if (!signal.aborted) {
      dispatch(fetchInboxItems({ fromUserAction: false, inboxOnly: true }));
    }
  });
}

async function decryptLiveFrameAsync(
  frame: LiveFrameResponse,
  getState: () => RootState,
  encryptionService: EncryptionService,
): Promise<LiveSessionUserEvent | undefined> {
  const friend = selectAcceptedFriends(getState()).find((x) => x.id === frame.userId && x.theirKeys.length);
  if (!friend) {
    return undefined;
  }
  const item = await toFeedItemAsync(frame, friend, encryptionService);
  if (!(item instanceof LiveSessionUserEvent) || item.userId !== frame.userId || item.isStale(Instant.now())) {
    return undefined;
  }
  const finished = getState().feed.feed.some((x) => x.userId === item.userId && x.eventId === item.eventId);
  return finished ? undefined : item;
}
