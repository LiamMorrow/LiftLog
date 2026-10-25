import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { combineReducers } from '@reduxjs/toolkit';
import { Instant, LocalDate } from '@js-joda/core';
import { addFeedItemEffects, publishLiveSessionAsync } from '@/store/feed/feed-items-effects';
import { addLiveSessionEffects, LIVE_PUBLISH_INTERVAL_MS } from '@/store/feed/live-session-effects';
import { addReactionEffects } from '@/store/feed/reaction-effects';
import { createAddEffectTestBed } from '@/utils/__test__/add-effect-testbed';
import feedReducer, { cheerFeedItem, fetchFeedItems, setIdentity } from '@/store/feed';
import { makeFriend } from '@/store/feed/__test__/friends';
import {
  deleteStoredSession,
  sessionFinished,
  setActiveSessionId,
  storedSessionsReducer,
} from '@/store/stored-sessions';
import { activeSessionUpdated } from '@/store/workout-worker';
import {
  FEED_EVENT_RETENTION_SECONDS,
  FeedIdentity,
  FeedUserEvent,
  fromFeedUserEventJSON,
  LIVE_EVENT_EXPIRY_SECONDS,
  LIVE_EVENT_STALE_SECONDS,
  LiveSessionUserEvent,
  Reaction,
  SessionUserEvent,
} from '@/models/feed-models';
import { userEventMigrations } from '@/models/storage/versions/migrations';
import { Session } from '@/models/session-models';
import { SessionBlueprint } from '@/models/blueprint-models';
import { Weight } from '@/models/weight';
import { AesKey, RsaKeyPair } from '@/models/encryption-models';
import { RemoteData } from '@/models/remote';
import { ApiResult } from '@/services/api-error';
import { fromJsonBytes, toJsonBytes } from '@/services/encryption-service';
import { AnyVersionUserEventJSON } from '@/models/storage/versions/any';
import { InboxRecipient } from '@/services/feed-follow-service';
import { createTestDb } from '@/utils/__test__/test-db';

const FRIEND_ID = 'friend-1';

function session(id: string, bodyweight?: Weight): Session {
  return new Session(id, new SessionBlueprint('Push', [], ''), [], LocalDate.of(2026, 10, 25), bodyweight, undefined);
}

function liveEvent(eventId: string, publishedAt = Instant.now(), userId = FRIEND_ID) {
  return new LiveSessionUserEvent(
    userId,
    eventId,
    publishedAt,
    publishedAt.plusSeconds(LIVE_EVENT_EXPIRY_SECONDS),
    session(eventId),
  );
}

function finishedEvent(eventId: string) {
  return new SessionUserEvent(
    FRIEND_ID,
    eventId,
    Instant.now(),
    Instant.now().plusSeconds(FEED_EVENT_RETENTION_SECONDS),
    session(eventId),
  );
}

function identity(publishWorkouts: boolean, publishBodyweight = false): FeedIdentity {
  return new FeedIdentity(
    'me',
    'lookup',
    {} as AesKey,
    {} as RsaKeyPair,
    'password',
    'Me',
    publishBodyweight,
    false,
    publishWorkouts,
  );
}

describe('LiveSessionUserEvent JSON', () => {
  it('round trips through the user event migrations', () => {
    const event = liveEvent('s1');

    const restored = fromFeedUserEventJSON(
      userEventMigrations.migrate(fromJsonBytes<AnyVersionUserEventJSON>(toJsonBytes(event.toJSON()))),
    );

    expect(restored.type).toBe('LiveSessionUserEvent');
    expect(restored.equals(event)).toBe(true);
  });

  it('is stale once it has not been republished for the stale window', () => {
    const publishedAt = Instant.now();
    const event = liveEvent('s1', publishedAt);

    expect(event.isStale(publishedAt.plusSeconds(LIVE_EVENT_STALE_SECONDS - 1))).toBe(false);
    expect(event.isStale(publishedAt.plusSeconds(LIVE_EVENT_STALE_SECONDS + 1))).toBe(true);
  });
});

function ingestionTestBed(events: FeedUserEvent[], existingFeed: SessionUserEvent[] = []) {
  const services = {
    feedApiService: {
      getUserEventsAsync: vi.fn().mockResolvedValue(
        ApiResult.success({
          events: events.map((event) => ({
            userId: event.userId,
            eventId: event.eventId,
            encryptedEventPayload: toJsonBytes(event.toJSON()),
            encryptedEventIV: new Uint8Array(),
            expiry: event.expiry.toString(),
          })),
          invalidFollowSecrets: [],
        }),
      ),
      getUsersAsync: vi.fn().mockResolvedValue(ApiResult.success({ users: {} })),
    },
    encryptionService: {
      decryptAndVerifyAsync: vi.fn((payload: { encryptedPayload: Uint8Array }) =>
        Promise.resolve(payload.encryptedPayload),
      ),
    },
  };

  const testBed = createAddEffectTestBed({
    initialState: {
      feed: { friends: { [FRIEND_ID]: makeFriend(FRIEND_ID) }, feed: existingFeed },
    },
    services,
    reducer: combineReducers({ feed: feedReducer, storedSessions: storedSessionsReducer }),
  });
  addFeedItemEffects(testBed.addEffect);
  return Object.assign(testBed, { services });
}

describe('fetching live workouts', () => {
  it('keeps live workouts out of the feed', async () => {
    const testBed = ingestionTestBed([liveEvent('live-1'), finishedEvent('done-1')]);

    await testBed.dispatchHandled(fetchFeedItems({ fromUserAction: false }));

    expect(testBed.getState().feed.liveSessions.map((x) => x.eventId)).toEqual(['live-1']);
    expect(testBed.getState().feed.feed.map((x) => x.eventId)).toEqual(['done-1']);
  });

  it('drops a live workout that has gone stale', async () => {
    const testBed = ingestionTestBed([
      liveEvent('stale', Instant.now().minusSeconds(LIVE_EVENT_STALE_SECONDS + 60)),
      liveEvent('fresh'),
    ]);

    await testBed.dispatchHandled(fetchFeedItems({ fromUserAction: false }));

    expect(testBed.getState().feed.liveSessions.map((x) => x.eventId)).toEqual(['fresh']);
  });

  it('drops a live workout once its finished workout is known', async () => {
    const testBed = ingestionTestBed([liveEvent('s1')], [finishedEvent('s1')]);

    await testBed.dispatchHandled(fetchFeedItems({ fromUserAction: false }));

    expect(testBed.getState().feed.liveSessions).toEqual([]);
  });

  it('drops a live workout from someone who is not a friend', async () => {
    const testBed = ingestionTestBed([liveEvent('s1', Instant.now(), 'stranger')]);

    await testBed.dispatchHandled(fetchFeedItems({ fromUserAction: false }));

    expect(testBed.getState().feed.liveSessions).toEqual([]);
  });

  it('asks for live workouts again on the next fetch', async () => {
    const testBed = ingestionTestBed([liveEvent('s1')]);

    await testBed.dispatchHandled(fetchFeedItems({ fromUserAction: false }));
    await testBed.dispatchHandled(fetchFeedItems({ fromUserAction: false }));

    const [, secondCall] = testBed.services.feedApiService.getUserEventsAsync.mock.calls as [
      unknown,
      [{ users: { since: string }[] }],
    ];
    expect(secondCall[0].users[0]!.since).toBe('2000-01-01T00:00:00Z');
  });
});

function capturingServices() {
  const published: { type: string; eventId: string; expiry: string; session?: { bodyweight?: unknown } }[] = [];
  return {
    published,
    services: {
      encryptionService: {
        signAndEncryptAsync: vi.fn((payloadBytes: Uint8Array) => {
          published.push(JSON.parse(new TextDecoder().decode(payloadBytes)) as (typeof published)[number]);
          return Promise.resolve({ encryptedPayload: new Uint8Array(), iv: { value: new Uint8Array() } });
        }),
      },
      feedApiService: { putUserEventAsync: vi.fn().mockResolvedValue(ApiResult.success()) },
    },
  };
}

describe('publishLiveSessionAsync', () => {
  it('publishes a short-lived live event under the session id, without bodyweight unless published', async () => {
    const { published, services } = capturingServices();

    await publishLiveSessionAsync(
      identity(true),
      session('s1', new Weight(80, 'kilograms')),
      services.encryptionService as never,
      services.feedApiService as never,
    );

    expect(published[0]!.type).toBe('LiveSessionUserEvent');
    expect(published[0]!.eventId).toBe('s1');
    expect(published[0]!.session?.bodyweight).toBeUndefined();
    const expected = Date.now() + LIVE_EVENT_EXPIRY_SECONDS * 1000;
    expect(Math.abs(Date.parse(published[0]!.expiry) - expected)).toBeLessThan(60_000);
  });
});

describe('live session effects', () => {
  let clock = Date.parse('2026-10-25T09:00:00Z');

  beforeEach(() => {
    clock += 24 * 60 * 60 * 1000;
    vi.useFakeTimers({ now: clock, toFake: ['setTimeout', 'clearTimeout', 'Date'] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function liveTestBed(sessionId: string, publishWorkouts: boolean) {
    const { published, services } = capturingServices();
    const active = session(sessionId);
    const testBed = createAddEffectTestBed({
      initialState: {
        feed: { identity: RemoteData.success(identity(publishWorkouts)) },
        storedSessions: { openSessions: { [sessionId]: active }, activeSessionId: sessionId },
      },
      services,
      reducer: combineReducers({ feed: feedReducer, storedSessions: storedSessionsReducer }),
    });
    addLiveSessionEffects(testBed.addEffect);
    const update = () => testBed.dispatchHandled(activeSessionUpdated({ before: active, after: active }));
    return Object.assign(testBed, { published, update });
  }

  it('publishes the active workout while workouts are published', async () => {
    const testBed = liveTestBed('a1', true);

    await testBed.update();

    expect(testBed.published.map((x) => [x.type, x.eventId])).toEqual([['LiveSessionUserEvent', 'a1']]);
  });

  it('publishes nothing while workouts are not published', async () => {
    const testBed = liveTestBed('a2', false);

    await testBed.update();

    expect(testBed.published).toEqual([]);
  });

  it('waits out the interval before publishing again', async () => {
    const testBed = liveTestBed('a3', true);
    await testBed.update();

    const second = testBed.update();
    await vi.advanceTimersByTimeAsync(LIVE_PUBLISH_INTERVAL_MS - 1000);
    expect(testBed.published).toHaveLength(1);

    await vi.advanceTimersByTimeAsync(1000);
    await second;
    expect(testBed.published).toHaveLength(2);
  });

  it('withdraws the live workout when it is discarded', async () => {
    const testBed = liveTestBed('a4', true);
    await testBed.update();

    await testBed.dispatchHandled(deleteStoredSession('a4'));

    expect(testBed.published.map((x) => [x.type, x.eventId])).toEqual([
      ['LiveSessionUserEvent', 'a4'],
      ['RemovedSessionUserEvent', 'a4'],
    ]);
  });

  it('withdraws a discarded active workout this run has not published yet', async () => {
    const testBed = liveTestBed('a7', true);

    await testBed.dispatchHandled(deleteStoredSession('a7'));

    expect(testBed.published.map((x) => [x.type, x.eventId])).toEqual([['RemovedSessionUserEvent', 'a7']]);
  });

  it('leaves a finished workout for the finished publish to replace', async () => {
    const testBed = liveTestBed('a5', true);
    await testBed.update();

    await testBed.dispatchHandled(sessionFinished('a5'));
    await testBed.dispatchHandled(setActiveSessionId(undefined));
    await testBed.dispatchHandled(deleteStoredSession('a5'));

    expect(testBed.published.map((x) => x.type)).toEqual(['LiveSessionUserEvent']);
  });

  it('withdraws the live workout when publishing is turned off', async () => {
    const testBed = liveTestBed('a6', true);
    await testBed.update();

    await testBed.dispatchHandled(setIdentity(RemoteData.success(identity(false))));

    expect(testBed.published.map((x) => [x.type, x.eventId])).toEqual([
      ['LiveSessionUserEvent', 'a6'],
      ['RemovedSessionUserEvent', 'a6'],
    ]);
  });
});

describe('cheering a live workout', () => {
  it('sends the cheer to the friend who is training', async () => {
    vi.useFakeTimers();
    const reactionMessage = vi.fn((_: FeedIdentity, recipient: InboxRecipient, reaction: Reaction) =>
      Promise.resolve({
        messageId: reaction.reactionId,
        recipientId: recipient.id,
        type: 'Reaction' as const,
        encryptedMessage: [new Uint8Array([1])],
      }),
    );
    const testBed = createAddEffectTestBed({
      initialState: {
        feed: {
          identity: RemoteData.success(identity(true)),
          friends: { [FRIEND_ID]: makeFriend(FRIEND_ID) },
          liveSessions: [liveEvent('live-1')],
        },
      },
      services: { feedFollowService: { reactionMessage }, db: await createTestDb() },
      reducer: combineReducers({ feed: feedReducer }),
    });
    addReactionEffects(testBed.addEffect);

    const cheering = testBed.dispatchHandled(cheerFeedItem({ eventId: 'live-1', emoji: '💪', fromUserAction: true }));
    await vi.advanceTimersByTimeAsync(1500);
    await cheering;
    vi.useRealTimers();

    expect(reactionMessage.mock.calls.map((call) => [call[1].id, call[2].eventId])).toEqual([[FRIEND_ID, 'live-1']]);
  });
});
