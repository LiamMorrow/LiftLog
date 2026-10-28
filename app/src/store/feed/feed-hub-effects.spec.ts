import { afterEach, describe, expect, it, vi } from 'vitest';
import { combineReducers } from '@reduxjs/toolkit';
import { Instant, LocalDate } from '@js-joda/core';
import { addFeedHubEffects, INBOX_NUDGE_COALESCE_MS } from '@/store/feed/feed-hub-effects';
import { createAddEffectTestBed } from '@/utils/__test__/add-effect-testbed';
import feedReducer, {
  acquireFeedHubLease,
  fetchFeedItems,
  fetchInboxItems,
  inboxNudged,
  liveFrameEnded,
  liveFrameReceived,
  removeFriend,
  watchLiveSessions,
} from '@/store/feed';
import { makeFriend } from '@/store/feed/__test__/friends';
import {
  FEED_EVENT_RETENTION_SECONDS,
  LIVE_EVENT_STALE_SECONDS,
  LiveSessionUserEvent,
  SessionUserEvent,
} from '@/models/feed-models';
import { LiveFrameResponse } from '@/models/feed-api-models';
import { Session } from '@/models/session-models';
import { SessionBlueprint } from '@/models/blueprint-models';
import { toJsonBytes } from '@/services/encryption-service';

const FRIEND_ID = 'friend-1';

function session(id: string) {
  return new Session(id, new SessionBlueprint('Push', [], ''), [], LocalDate.of(2026, 10, 28), undefined, undefined);
}

function liveEvent(eventId: string, publishedAt = Instant.now(), userId = FRIEND_ID) {
  return new LiveSessionUserEvent(
    userId,
    eventId,
    publishedAt,
    publishedAt.plusSeconds(LIVE_EVENT_STALE_SECONDS),
    session(eventId),
  );
}

function frameOf(event: LiveSessionUserEvent | SessionUserEvent, userId = event.userId): LiveFrameResponse {
  return {
    userId,
    eventId: event.eventId,
    encryptedEventPayload: toJsonBytes(event.toJSON()),
    encryptedEventIV: new Uint8Array(),
    timestamp: event.timestamp.toString(),
  };
}

function hubTestBed({
  feed = [],
  liveSessions = [],
  watchResponse,
}: {
  feed?: SessionUserEvent[];
  liveSessions?: LiveSessionUserEvent[];
  watchResponse?: { frames: LiveFrameResponse[]; invalidFollowSecrets: string[] };
} = {}) {
  const feedHubService = {
    acquire: vi.fn(),
    release: vi.fn(),
    sync: vi.fn(),
    hasLease: vi.fn((kind: string) => kind === 'viewer'),
    watch: vi.fn().mockResolvedValue(watchResponse),
  };
  const testBed = createAddEffectTestBed({
    initialState: {
      feed: {
        friends: { [FRIEND_ID]: makeFriend(FRIEND_ID), other: makeFriend('other') },
        feed,
        liveSessions,
      },
    },
    services: {
      feedHubService,
      encryptionService: {
        decryptAndVerifyAsync: vi.fn((payload: { encryptedPayload: Uint8Array }) =>
          Promise.resolve(payload.encryptedPayload),
        ),
      },
    },
    reducer: combineReducers({ feed: feedReducer }),
  });
  addFeedHubEffects(testBed.addEffect);
  return Object.assign(testBed, { feedHubService });
}

describe('feed hub effects', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows a live workout a friend sends', async () => {
    const testBed = hubTestBed();

    await testBed.dispatchHandled(liveFrameReceived(frameOf(liveEvent('s1'))));

    expect(testBed.getState().feed.liveSessions.map((x) => x.eventId)).toEqual(['s1']);
  });

  it('replaces the friend’s previous live workout', async () => {
    const testBed = hubTestBed({ liveSessions: [liveEvent('old')] });

    await testBed.dispatchHandled(liveFrameReceived(frameOf(liveEvent('new'))));

    expect(testBed.getState().feed.liveSessions.map((x) => x.eventId)).toEqual(['new']);
  });

  it('ignores a live workout from someone who is not a friend', async () => {
    const testBed = hubTestBed();

    await testBed.dispatchHandled(liveFrameReceived(frameOf(liveEvent('s1', Instant.now(), 'stranger'))));

    expect(testBed.getState().feed.liveSessions).toEqual([]);
  });

  it('ignores a frame whose signed author is not the user the hub says sent it', async () => {
    const testBed = hubTestBed();

    await testBed.dispatchHandled(liveFrameReceived(frameOf(liveEvent('s1', Instant.now(), 'other'), FRIEND_ID)));

    expect(testBed.getState().feed.liveSessions).toEqual([]);
  });

  it('ignores a stale live workout', async () => {
    const testBed = hubTestBed();

    await testBed.dispatchHandled(
      liveFrameReceived(frameOf(liveEvent('s1', Instant.now().minusSeconds(LIVE_EVENT_STALE_SECONDS + 60)))),
    );

    expect(testBed.getState().feed.liveSessions).toEqual([]);
  });

  it('ignores a live workout that has already finished', async () => {
    const finished = new SessionUserEvent(
      FRIEND_ID,
      's1',
      Instant.now(),
      Instant.now().plusSeconds(FEED_EVENT_RETENTION_SECONDS),
      session('s1'),
    );
    const testBed = hubTestBed({ feed: [finished] });

    await testBed.dispatchHandled(liveFrameReceived(frameOf(liveEvent('s1'))));

    expect(testBed.getState().feed.liveSessions).toEqual([]);
  });

  it('removes an ended live workout and fetches the finished one', async () => {
    const testBed = hubTestBed({ liveSessions: [liveEvent('s1')] });

    await testBed.dispatchHandled(liveFrameEnded({ userId: FRIEND_ID, eventId: 's1' }));

    expect(testBed.getState().feed.liveSessions).toEqual([]);
    expect(testBed.getDispatchedAction(fetchFeedItems).payload.fromUserAction).toBe(false);
  });

  it('fetches the inbox once a burst of nudges settles', async () => {
    vi.useFakeTimers();
    const testBed = hubTestBed();

    const handled = testBed.dispatchHandled(inboxNudged());
    await vi.advanceTimersByTimeAsync(INBOX_NUDGE_COALESCE_MS - 1);
    testBed.expectNotDispatched(fetchInboxItems);
    await vi.advanceTimersByTimeAsync(1);
    await handled;

    expect(testBed.getDispatchedAction(fetchInboxItems).payload.inboxOnly).toBe(true);
  });

  it('watches every friend and shows who is training', async () => {
    const testBed = hubTestBed({
      watchResponse: { frames: [frameOf(liveEvent('s1'))], invalidFollowSecrets: [] },
    });

    await testBed.dispatchHandled(watchLiveSessions());

    expect(testBed.feedHubService.watch).toHaveBeenCalledWith([`their-secret-${FRIEND_ID}`, 'their-secret-other']);
    expect(testBed.getState().feed.liveSessions.map((x) => x.eventId)).toEqual(['s1']);
  });

  it('removes a friend whose follow secret the hub rejects', async () => {
    const testBed = hubTestBed({ watchResponse: { frames: [], invalidFollowSecrets: ['their-secret-other'] } });

    await testBed.dispatchHandled(watchLiveSessions());

    expect(testBed.getDispatchedAction(removeFriend).payload.friendId).toBe('other');
  });

  it('watches friends as soon as the feed takes a lease', async () => {
    const testBed = hubTestBed();

    await testBed.dispatchHandled(acquireFeedHubLease('viewer'));

    expect(testBed.feedHubService.acquire).toHaveBeenCalledWith('viewer');
    expect(testBed.dispatchedActions.map((x) => x.type)).toContain(watchLiveSessions.type);
  });
});
