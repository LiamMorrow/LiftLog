import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { combineReducers } from '@reduxjs/toolkit';
import { Instant, LocalDate } from '@js-joda/core';
import { addFeedItemEffects, encryptLiveSessionAsync } from '@/store/feed/feed-items-effects';
import { addLiveSessionEffects, LIVE_PUBLISH_COALESCE_MS } from '@/store/feed/live-session-effects';
import { addReactionEffects } from '@/store/feed/reaction-effects';
import { createAddEffectTestBed } from '@/utils/__test__/add-effect-testbed';
import feedReducer, { cheerFeedItem, fetchFeedItems, publishUnpublishedSessions, setIdentity } from '@/store/feed';
import { feedUnpublishedSessionsSchema } from '@/db/schema';
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
    publishedAt.plusSeconds(LIVE_EVENT_STALE_SECONDS),
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

function identity(publishWorkouts: boolean, publishBodyweight = false, shareLiveWorkouts = true): FeedIdentity {
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
    [],
    shareLiveWorkouts,
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

describe('FeedIdentity live sharing', () => {
  it('round trips shareLiveWorkouts, and reads an identity saved without it as off', () => {
    const json = identity(true, false, true)
      .with({
        aesKey: { value: new Uint8Array([1]), algorithm: 'AES-GCM' },
        rsaKeyPair: {
          publicKey: { spkiPublicKeyBytes: new Uint8Array([2]) },
          privateKey: { pkcs8PrivateKeyBytes: new Uint8Array([3]) },
        },
      })
      .toJSON();
    const { shareLiveWorkouts: _, ...withoutField } = json;

    expect(FeedIdentity.fromJSON(json).shareLiveWorkouts).toBe(true);
    expect(FeedIdentity.fromJSON(withoutField).shareLiveWorkouts).toBe(false);
  });

  it('only shares live while workouts are published', () => {
    expect(identity(true, false, true).sharesLiveWorkouts).toBe(true);
    expect(identity(false, false, true).sharesLiveWorkouts).toBe(false);
  });
});

function ingestionTestBed(
  events: FeedUserEvent[],
  {
    existingFeed = [],
    liveSessions = [],
  }: { existingFeed?: SessionUserEvent[]; liveSessions?: LiveSessionUserEvent[] } = {},
) {
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
      feed: { friends: { [FRIEND_ID]: makeFriend(FRIEND_ID) }, feed: existingFeed, liveSessions },
    },
    services,
    reducer: combineReducers({ feed: feedReducer, storedSessions: storedSessionsReducer }),
  });
  addFeedItemEffects(testBed.addEffect);
  return Object.assign(testBed, { services });
}

describe('fetching the feed while friends train', () => {
  it('drops a live workout once the fetch brings its finished workout', async () => {
    const testBed = ingestionTestBed([finishedEvent('s1')], { liveSessions: [liveEvent('s1'), liveEvent('s2')] });

    await testBed.dispatchHandled(fetchFeedItems({ fromUserAction: false }));

    expect(testBed.getState().feed.liveSessions.map((x) => x.eventId)).toEqual(['s2']);
  });

  it('drops a live workout from someone who is no longer a friend', async () => {
    const testBed = ingestionTestBed([], { liveSessions: [liveEvent('s1', Instant.now(), 'stranger')] });

    await testBed.dispatchHandled(fetchFeedItems({ fromUserAction: false }));

    expect(testBed.getState().feed.liveSessions).toEqual([]);
  });

  it('keeps a live workout that arrives as a feed item out of the feed', async () => {
    const testBed = ingestionTestBed([liveEvent('live-1'), finishedEvent('done-1')]);

    await testBed.dispatchHandled(fetchFeedItems({ fromUserAction: false }));

    expect(testBed.getState().feed.feed.map((x) => x.eventId)).toEqual(['done-1']);
  });
});

function decodePublished(payloadBytes: Uint8Array) {
  return JSON.parse(new TextDecoder().decode(payloadBytes)) as {
    type: string;
    eventId: string;
    session?: { bodyweight?: unknown };
  };
}

function capturingEncryption() {
  const published: ReturnType<typeof decodePublished>[] = [];
  return {
    published,
    encryptionService: {
      signAndEncryptAsync: vi.fn((payloadBytes: Uint8Array) => {
        published.push(decodePublished(payloadBytes));
        return Promise.resolve({ encryptedPayload: payloadBytes, iv: { value: new Uint8Array() } });
      }),
    },
  };
}

describe('encryptLiveSessionAsync', () => {
  it('encrypts a live event under the session id, without bodyweight unless published', async () => {
    const { published, encryptionService } = capturingEncryption();

    await encryptLiveSessionAsync(
      identity(true),
      session('s1', new Weight(80, 'kilograms')),
      encryptionService as never,
    );

    expect(published[0]!.type).toBe('LiveSessionUserEvent');
    expect(published[0]!.eventId).toBe('s1');
    expect(published[0]!.session?.bodyweight).toBeUndefined();
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

  function liveTestBed(sessionId: string, { sharing = true, publishWorkouts = true, trainerLease = true } = {}) {
    const { published, encryptionService } = capturingEncryption();
    const feedHubService = {
      hasLease: vi.fn((kind: string) => trainerLease && kind === 'trainer'),
      publishLive: vi.fn().mockResolvedValue(true),
      endLive: vi.fn().mockResolvedValue(true),
    };
    const active = session(sessionId);
    const testBed = createAddEffectTestBed({
      initialState: {
        feed: { identity: RemoteData.success(identity(publishWorkouts, false, sharing)) },
        storedSessions: { openSessions: { [sessionId]: active }, activeSessionId: sessionId },
      },
      services: { encryptionService, feedHubService },
      reducer: combineReducers({ feed: feedReducer, storedSessions: storedSessionsReducer }),
    });
    addLiveSessionEffects(testBed.addEffect);
    const update = async () => {
      const handled = testBed.dispatchHandled(activeSessionUpdated({ before: active, after: active }));
      await vi.advanceTimersByTimeAsync(LIVE_PUBLISH_COALESCE_MS);
      await handled;
    };
    return Object.assign(testBed, { published, feedHubService, update });
  }

  it('publishes the active workout to the hub while sharing live', async () => {
    const testBed = liveTestBed('a1');

    await testBed.update();

    expect(testBed.published.map((x) => [x.type, x.eventId])).toEqual([['LiveSessionUserEvent', 'a1']]);
    expect(testBed.feedHubService.publishLive.mock.calls.map((call) => call[0] as string)).toEqual(['a1']);
  });

  it('waits for changes to settle before publishing', async () => {
    const testBed = liveTestBed('a2');

    const handled = testBed.dispatchHandled(activeSessionUpdated({ before: session('a2'), after: session('a2') }));
    await vi.advanceTimersByTimeAsync(LIVE_PUBLISH_COALESCE_MS - 1);
    expect(testBed.feedHubService.publishLive).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    await handled;
    expect(testBed.feedHubService.publishLive).toHaveBeenCalledTimes(1);
  });

  it('publishes nothing while live workouts are not shared', async () => {
    const testBed = liveTestBed('a3', { sharing: false });

    await testBed.update();

    expect(testBed.feedHubService.publishLive).not.toHaveBeenCalled();
  });

  it('publishes nothing while workouts are not published, even with live sharing on', async () => {
    const testBed = liveTestBed('a4', { publishWorkouts: false });

    await testBed.update();

    expect(testBed.feedHubService.publishLive).not.toHaveBeenCalled();
  });

  it('publishes nothing while the workout screen does not hold the hub', async () => {
    const testBed = liveTestBed('a5', { trainerLease: false });

    await testBed.update();

    expect(testBed.feedHubService.publishLive).not.toHaveBeenCalled();
  });

  it('ends the live workout when it is discarded', async () => {
    const testBed = liveTestBed('a6');
    await testBed.update();

    await testBed.dispatchHandled(deleteStoredSession('a6'));

    expect(testBed.feedHubService.endLive).toHaveBeenCalledWith('a6');
  });

  it('ends a discarded active workout this run has not published yet', async () => {
    const testBed = liveTestBed('a7');

    await testBed.dispatchHandled(deleteStoredSession('a7'));

    expect(testBed.feedHubService.endLive).toHaveBeenCalledWith('a7');
  });

  it('leaves a finished workout for the finished publish to end', async () => {
    const testBed = liveTestBed('a8');
    await testBed.update();

    await testBed.dispatchHandled(sessionFinished('a8'));
    await testBed.dispatchHandled(setActiveSessionId(undefined));
    await testBed.dispatchHandled(deleteStoredSession('a8'));

    expect(testBed.feedHubService.endLive).not.toHaveBeenCalled();
  });

  it('ends the live workout when sharing is turned off', async () => {
    const testBed = liveTestBed('a9');
    await testBed.update();

    await testBed.dispatchHandled(setIdentity(RemoteData.success(identity(true, false, false))));

    expect(testBed.feedHubService.endLive).toHaveBeenCalledWith('a9');
  });

  it('publishes straight away when sharing is turned on mid-workout', async () => {
    const testBed = liveTestBed('a10', { sharing: false });

    await testBed.dispatchHandled(setIdentity(RemoteData.success(identity(true, false, true))));

    expect(testBed.feedHubService.publishLive.mock.calls.map((call) => call[0] as string)).toEqual(['a10']);
  });
});

describe('finishing a live workout', () => {
  it('ends the live workout only after the finished workout is published', async () => {
    const db = await createTestDb();
    await db.insert(feedUnpublishedSessionsSchema).values({ sessionId: 'f1' });
    const calls: string[] = [];
    const { encryptionService } = capturingEncryption();
    const testBed = createAddEffectTestBed({
      initialState: { feed: { identity: RemoteData.success(identity(true)) } },
      services: {
        db,
        encryptionService,
        feedApiService: {
          putUserEventAsync: vi.fn(() => {
            calls.push('put');
            return Promise.resolve(ApiResult.success());
          }),
        },
        feedHubService: {
          endLive: vi.fn((eventId: string) => {
            calls.push(`end ${eventId}`);
            return Promise.resolve(true);
          }),
        },
      },
      reducer: combineReducers({ feed: feedReducer, storedSessions: storedSessionsReducer }),
    });
    addFeedItemEffects(testBed.addEffect);

    await testBed.dispatchHandled(publishUnpublishedSessions());

    expect(calls).toEqual(['put', 'end f1']);
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
