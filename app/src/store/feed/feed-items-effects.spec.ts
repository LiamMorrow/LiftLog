import { describe, expect, it, vi } from 'vitest';
import { combineReducers } from '@reduxjs/toolkit';
import { Instant, LocalDate } from '@js-joda/core';
import { addFeedItemEffects, publishSessionAsync } from '@/store/feed/feed-items-effects';
import { createAddEffectTestBed } from '@/utils/__test__/add-effect-testbed';
import feedReducer, { fetchFeedItems, patchFriendProfiles, removeFriend, repairFriends } from '@/store/feed';
import { makeFriend } from '@/store/feed/__test__/friends';
import { storedSessionsReducer } from '@/store/stored-sessions';
import { FeedIdentity, FEED_EVENT_RETENTION_SECONDS, Friend, SessionUserEvent } from '@/models/feed-models';
import { Session } from '@/models/session-models';
import { SessionBlueprint } from '@/models/blueprint-models';
import { Weight } from '@/models/weight';
import { AesKey, RsaKeyPair } from '@/models/encryption-models';
import { ApiErrorType, ApiResult } from '@/services/api-error';
import { EncryptionService, toJsonBytes } from '@/services/encryption-service';
import { SessionJSON } from '@/models/storage/versions/latest';

// ─── Fixtures ───────────────────────────────────────────────────────────────

function identityWith(publishBodyweight: boolean): FeedIdentity {
  return new FeedIdentity(
    'user-1',
    'lookup-1',
    {} as AesKey,
    {} as RsaKeyPair,
    'password',
    'Bob',
    publishBodyweight,
    false,
    true,
  );
}

function sessionWithBodyweight(bodyweight: Weight | undefined): Session {
  return new Session(
    'session-1',
    new SessionBlueprint('Push', [], ''),
    [],
    LocalDate.of(2026, 7, 13),
    bodyweight,
    undefined,
  );
}

/**
 * Captures the plaintext handed to the encryption service - the only place the published bodyweight is
 * observable. The reader's UI hides bodyweight regardless of this flag, which is how the leak went unnoticed.
 */
function capturingServices() {
  let publishedPayload: { session: SessionJSON; expiry: string } | undefined;

  const encryptionService = {
    signRsa256PssAndEncryptAesCbcAsync: vi.fn((payloadBytes: Uint8Array) => {
      publishedPayload = JSON.parse(new TextDecoder().decode(payloadBytes)) as typeof publishedPayload;
      return Promise.resolve({ encryptedPayload: new Uint8Array(), iv: { value: new Uint8Array() } });
    }),
  };

  const feedApiService = {
    putUserEventAsync: vi.fn().mockResolvedValue(ApiResult.success()),
  };

  return { encryptionService, feedApiService, getPublishedPayload: () => publishedPayload };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('publishSessionAsync', () => {
  it('omits bodyweight from the published payload when publishBodyweight is off', async () => {
    const { encryptionService, feedApiService, getPublishedPayload } = capturingServices();

    await publishSessionAsync(
      identityWith(false),
      sessionWithBodyweight(new Weight(80, 'kilograms')),
      encryptionService as never,
      feedApiService as never,
    );

    expect(getPublishedPayload()?.session.bodyweight).toBeUndefined();
  });

  it('includes bodyweight when publishBodyweight is on', async () => {
    const { encryptionService, feedApiService, getPublishedPayload } = capturingServices();

    await publishSessionAsync(
      identityWith(true),
      sessionWithBodyweight(new Weight(80, 'kilograms')),
      encryptionService as never,
      feedApiService as never,
    );

    expect(getPublishedPayload()?.session.bodyweight?.value).toBe('80');
    expect(getPublishedPayload()?.session.bodyweight?.unit).toBe('kilograms');
  });

  it('publishes the rest of the session unchanged when bodyweight is withheld', async () => {
    const { encryptionService, feedApiService, getPublishedPayload } = capturingServices();

    await publishSessionAsync(
      identityWith(false),
      sessionWithBodyweight(new Weight(80, 'kilograms')),
      encryptionService as never,
      feedApiService as never,
    );

    const published = getPublishedPayload();
    expect(published?.session.id).toBe('session-1');
    expect(published?.session.date).toBe('2026-07-13');
    expect(published?.session.blueprint.name).toBe('Push');
  });

  it('does not mutate the stored session when withholding bodyweight', async () => {
    const { encryptionService, feedApiService } = capturingServices();
    const session = sessionWithBodyweight(new Weight(80, 'kilograms'));

    await publishSessionAsync(identityWith(false), session, encryptionService as never, feedApiService as never);

    expect(session.bodyweight?.value.toString()).toBe('80');
  });

  it('expires the event after the feed retention window', async () => {
    const { encryptionService, feedApiService, getPublishedPayload } = capturingServices();

    await publishSessionAsync(
      identityWith(true),
      sessionWithBodyweight(undefined),
      encryptionService as never,
      feedApiService as never,
    );

    const expiry = Date.parse(getPublishedPayload()!.expiry);
    const expected = Date.now() + FEED_EVENT_RETENTION_SECONDS * 1000;
    expect(Math.abs(expiry - expected)).toBeLessThan(60_000);
  });
});

// ─── Ingestion ────────────────────────────────────────────────────────────────

const FOLLOWED_ID = 'followed-1';

/** A session event payload as it arrives over the wire, at an arbitrary schema version. */
function eventPayload(eventId: string, version: number): Uint8Array {
  const event = new SessionUserEvent(
    FOLLOWED_ID,
    eventId,
    Instant.now(),
    Instant.now().plusSeconds(FEED_EVENT_RETENTION_SECONDS),
    new Session(eventId, new SessionBlueprint('Push', [], ''), [], LocalDate.of(2026, 7, 13), undefined, undefined),
  );
  return toJsonBytes({ ...event.toJSON(), version });
}

function ingestionTestBed(
  events: { eventId: string; version: number }[],
  followedIds = [FOLLOWED_ID],
  options: { friends?: Friend[]; invalidFollowSecrets?: string[] } = {},
) {
  const friends = options.friends ?? followedIds.map((id) => makeFriend(id));
  const services = {
    feedApiService: {
      getUserEventsAsync: vi.fn().mockResolvedValue(
        ApiResult.success({
          events: events.map(({ eventId, version }) => ({
            userId: FOLLOWED_ID,
            eventId,
            // Decryption echoes the payload back, so carry the plaintext here.
            encryptedEventPayload: eventPayload(eventId, version),
            encryptedEventIV: new Uint8Array(),
            expiry: Instant.now().plusSeconds(FEED_EVENT_RETENTION_SECONDS).toString(),
          })),
          invalidFollowSecrets: options.invalidFollowSecrets ?? [],
        }),
      ),
      getUsersAsync: vi.fn().mockResolvedValue(
        ApiResult.success({
          users: Object.fromEntries(
            followedIds.map((id) => [
              id,
              { encryptedName: new TextEncoder().encode(`fresh-${id}`), encryptionIV: new Uint8Array() },
            ]),
          ),
        }),
      ),
    },
    encryptionService: {
      decryptAesCbcAndVerifyRsa256PssAsync: vi.fn((payload: { encryptedPayload: Uint8Array }, _key: AesKey) =>
        Promise.resolve(payload.encryptedPayload),
      ),
    },
  };

  const testBed = createAddEffectTestBed({
    initialState: {
      feed: { friends: Object.fromEntries(friends.map((friend) => [friend.id, friend])) },
    },
    services: services,
    reducer: combineReducers({ feed: feedReducer, storedSessions: storedSessionsReducer }),
  });

  addFeedItemEffects(testBed.addEffect);
  return Object.assign(testBed, { services });
}

function ingestedEventIds(testBed: ReturnType<typeof ingestionTestBed>): string[] {
  return testBed.getState().feed.feed.map((x) => x.eventId);
}

describe('fetchFeedItems ingestion', () => {
  it('ingests an item whose version is current', async () => {
    const testBed = ingestionTestBed([{ eventId: 'e1', version: 3 }]);

    await testBed.dispatchHandled(fetchFeedItems({ fromUserAction: false }));

    expect(ingestedEventIds(testBed)).toEqual(['e1']);
  });

  it('filters out an item whose version is newer than the app understands, without crashing', async () => {
    const testBed = ingestionTestBed([{ eventId: 'e1', version: 999 }]);

    await testBed.dispatchHandled(fetchFeedItems({ fromUserAction: false }));

    expect(ingestedEventIds(testBed)).toEqual([]);
    expect(testBed.getState().feed.isFetching).toBe(false);
  });

  it('keeps the valid items when only some fail to migrate', async () => {
    const testBed = ingestionTestBed([
      { eventId: 'good-1', version: 3 },
      { eventId: 'from-the-future', version: 999 },
      { eventId: 'good-2', version: 3 },
    ]);

    await testBed.dispatchHandled(fetchFeedItems({ fromUserAction: false }));

    expect(ingestedEventIds(testBed).sort()).toEqual(['good-1', 'good-2']);
  });

  it('refreshes every friend profile in a single dispatch', async () => {
    const testBed = ingestionTestBed([{ eventId: 'e1', version: 3 }], [FOLLOWED_ID, 'followed-2', 'followed-3']);

    await testBed.dispatchHandled(fetchFeedItems({ fromUserAction: false }));

    const patches = testBed.dispatchedActions.filter((x) => patchFriendProfiles.match(x));
    expect(patches.map((x) => x.payload.map((user) => user.id).sort())).toEqual([
      [FOLLOWED_ID, 'followed-2', 'followed-3'],
    ]);
    expect(testBed.getState().feed.friends[FOLLOWED_ID]!.name).toBe(`fresh-${FOLLOWED_ID}`);
  });

  it('only fetches accepted friends whose keys have arrived', async () => {
    const testBed = ingestionTestBed([], [FOLLOWED_ID], {
      friends: [
        makeFriend(FOLLOWED_ID),
        makeFriend('pending', { status: 'pending' }),
        makeFriend('legacy', { status: 'legacyFollowing' }),
        makeFriend('accepted-without-keys', { theirSecret: undefined, theirKeys: [] }),
      ],
    });

    await testBed.dispatchHandled(fetchFeedItems({ fromUserAction: false }));

    const request = testBed.services.feedApiService.getUserEventsAsync.mock.calls[0]![0] as {
      users: { userId: string }[];
    };
    const requested = request.users.map((x) => x.userId);
    expect(requested).toEqual([FOLLOWED_ID]);
  });

  it('tries every key a friend has shared until one decrypts', async () => {
    const oldKey = { value: new Uint8Array([7]) };
    const testBed = ingestionTestBed([{ eventId: 'e1', version: 3 }], [FOLLOWED_ID], {
      friends: [makeFriend(FOLLOWED_ID, { theirKeys: [{ value: new Uint8Array([9]) }, oldKey] })],
    });
    testBed.services.encryptionService.decryptAesCbcAndVerifyRsa256PssAsync.mockImplementation((payload, key) =>
      key === oldKey ? Promise.resolve(payload.encryptedPayload) : Promise.reject(new Error('wrong key')),
    );

    await testBed.dispatchHandled(fetchFeedItems({ fromUserAction: false }));

    expect(ingestedEventIds(testBed)).toEqual(['e1']);
  });

  it('keeps the last known profile when none of the keys decrypt it', async () => {
    const testBed = ingestionTestBed([], [FOLLOWED_ID]);
    testBed.services.encryptionService.decryptAesCbcAndVerifyRsa256PssAsync.mockImplementation(() =>
      Promise.reject(new Error('wrong key')),
    );

    await testBed.dispatchHandled(fetchFeedItems({ fromUserAction: false }));

    expect(testBed.getState().feed.friends[FOLLOWED_ID]!.name).toBe(`name-${FOLLOWED_ID}`);
  });

  it('reports friends whose profile no key decrypts, so they can be repaired', async () => {
    const testBed = ingestionTestBed([], [FOLLOWED_ID]);
    testBed.services.encryptionService.decryptAesCbcAndVerifyRsa256PssAsync.mockImplementation(() =>
      Promise.reject(new Error('wrong key')),
    );

    await testBed.dispatchHandled(fetchFeedItems({ fromUserAction: false }));

    expect(testBed.getDispatchedAction(repairFriends).payload).toEqual({ undecryptable: [FOLLOWED_ID] });
  });

  it('reports friends whose events no key decrypts, so they can be repaired', async () => {
    const testBed = ingestionTestBed([{ eventId: 'e1', version: 3 }], [FOLLOWED_ID]);
    testBed.services.feedApiService.getUsersAsync.mockResolvedValue(ApiResult.success({ users: {} }));
    testBed.services.encryptionService.decryptAesCbcAndVerifyRsa256PssAsync.mockImplementation(() =>
      Promise.reject(new Error('wrong key')),
    );

    await testBed.dispatchHandled(fetchFeedItems({ fromUserAction: false }));

    expect(testBed.getDispatchedAction(repairFriends).payload).toEqual({ undecryptable: [FOLLOWED_ID] });
  });

  it('does not treat an event from a newer app version as a key problem', async () => {
    const testBed = ingestionTestBed([{ eventId: 'from-the-future', version: 999 }]);

    await testBed.dispatchHandled(fetchFeedItems({ fromUserAction: false }));

    expect(testBed.getDispatchedAction(repairFriends).payload).toEqual({ undecryptable: [] });
  });

  it('does not repair a friend whose secret was revoked', async () => {
    const testBed = ingestionTestBed([], [FOLLOWED_ID], { invalidFollowSecrets: [`their-secret-${FOLLOWED_ID}`] });
    testBed.services.encryptionService.decryptAesCbcAndVerifyRsa256PssAsync.mockImplementation(() =>
      Promise.reject(new Error('wrong key')),
    );

    await testBed.dispatchHandled(fetchFeedItems({ fromUserAction: false }));

    expect(testBed.getDispatchedAction(repairFriends).payload).toEqual({ undecryptable: [] });
  });

  it('has nothing to repair when a friend has published nothing to decrypt', async () => {
    const testBed = ingestionTestBed([], [FOLLOWED_ID]);
    testBed.services.feedApiService.getUsersAsync.mockResolvedValue(
      ApiResult.success({ users: { [FOLLOWED_ID]: { encryptionIV: new Uint8Array() } } }),
    );
    testBed.services.encryptionService.decryptAesCbcAndVerifyRsa256PssAsync.mockImplementation(() =>
      Promise.reject(new Error('wrong key')),
    );

    await testBed.dispatchHandled(fetchFeedItems({ fromUserAction: false }));

    expect(testBed.getDispatchedAction(repairFriends).payload).toEqual({ undecryptable: [] });
  });

  it('does not look for repairs when the fetch fails', async () => {
    const testBed = ingestionTestBed([], [FOLLOWED_ID]);
    testBed.services.feedApiService.getUserEventsAsync.mockResolvedValue(
      ApiResult.fromError({ type: ApiErrorType.Unknown, message: 'offline', exception: undefined }),
    );

    await testBed.dispatchHandled(fetchFeedItems({ fromUserAction: false }));

    testBed.expectNotDispatched(repairFriends);
  });

  it('ends the friendship when the server says their secret was revoked', async () => {
    const testBed = ingestionTestBed([], [FOLLOWED_ID], { invalidFollowSecrets: [`their-secret-${FOLLOWED_ID}`] });

    await testBed.dispatchHandled(fetchFeedItems({ fromUserAction: false }));

    expect(testBed.getDispatchedAction(removeFriend).payload).toEqual({
      friendId: FOLLOWED_ID,
      notify: false,
      fromUserAction: false,
    });
  });
});

describe('fetchFeedItems with real encryption', () => {
  it('reads events published before a rotation with the older keys a friend shared', async () => {
    const encryptionService = new EncryptionService();
    const [oldKey, newKey, rsaKeyPair] = await Promise.all([
      encryptionService.generateAesKey(),
      encryptionService.generateAesKey(),
      encryptionService.generateRsaKeys(),
    ]);
    const publisher = new FeedIdentity(FOLLOWED_ID, 'lookup', oldKey, rsaKeyPair, 'pw', 'Bob', false, false, true);
    const putUserEventAsync = vi.fn().mockResolvedValue(ApiResult.success());
    await publishSessionAsync(publisher, sessionWithBodyweight(undefined), encryptionService, {
      putUserEventAsync,
    } as never);
    const published = putUserEventAsync.mock.calls[0]![0] as {
      eventId: string;
      encryptedEventPayload: Uint8Array;
      encryptedEventIV: Uint8Array;
      expiry: string;
    };

    const fetchWithKeys = async (theirKeys: AesKey[]) => {
      const testBed = createAddEffectTestBed({
        initialState: {
          feed: {
            friends: { [FOLLOWED_ID]: makeFriend(FOLLOWED_ID, { publicKey: rsaKeyPair.publicKey, theirKeys }) },
          },
        },
        services: {
          encryptionService,
          feedApiService: {
            getUserEventsAsync: vi
              .fn()
              .mockResolvedValue(
                ApiResult.success({ events: [{ ...published, userId: FOLLOWED_ID }], invalidFollowSecrets: [] }),
              ),
            getUsersAsync: vi.fn().mockResolvedValue(ApiResult.success({ users: {} })),
          },
        },
        reducer: combineReducers({ feed: feedReducer, storedSessions: storedSessionsReducer }),
      });
      addFeedItemEffects(testBed.addEffect);
      await testBed.dispatchHandled(fetchFeedItems({ fromUserAction: false }));
      return testBed.getState().feed.feed.map((x) => x.eventId);
    };

    expect(await fetchWithKeys([newKey, oldKey])).toEqual(['session-1']);
    expect(await fetchWithKeys([newKey])).toEqual([]);
  });
});
