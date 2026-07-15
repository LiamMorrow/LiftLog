import { describe, expect, it, vi } from 'vitest';
import { combineReducers } from '@reduxjs/toolkit';
import { Instant, LocalDate } from '@js-joda/core';
import { addFeedItemEffects, publishSessionAsync } from '@/store/feed/feed-items-effects';
import { createAddEffectTestBed } from '@/utils/__test__/add-effect-testbed';
import feedReducer, { fetchFeedItems } from '@/store/feed';
import { storedSessionsReducer } from '@/store/stored-sessions';
import { FeedIdentity, FEED_EVENT_RETENTION_SECONDS, FollowedFeedUser, SessionUserEvent } from '@/models/feed-models';
import { Session } from '@/models/session-models';
import { SessionBlueprint } from '@/models/blueprint-models';
import { Weight } from '@/models/weight';
import { AesKey, RsaKeyPair, RsaPublicKey } from '@/models/encryption-models';
import { ApiResult } from '@/services/api-error';
import { toJsonBytes } from '@/services/encryption-service';
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
 * Captures the plaintext handed to the encryption service — the only place the published bodyweight is
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
const followedPublicKey: RsaPublicKey = { spkiPublicKeyBytes: new Uint8Array([1]) };

function followedUser(): FollowedFeedUser {
  return new FollowedFeedUser(FOLLOWED_ID, followedPublicKey, 'Alice', undefined, {} as AesKey, 'follow-secret');
}

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

function ingestionTestBed(events: { eventId: string; version: number }[]) {
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
          invalidFollowSecrets: [],
        }),
      ),
      getUsersAsync: vi.fn().mockResolvedValue(ApiResult.success({ users: { [FOLLOWED_ID]: {} } })),
    },
    encryptionService: {
      decryptAesCbcAndVerifyRsa256PssAsync: vi.fn((payload: { encryptedPayload: Uint8Array }) =>
        Promise.resolve(payload.encryptedPayload),
      ),
    },
  };

  const testBed = createAddEffectTestBed({
    initialState: {
      feed: { followedUsers: { [FOLLOWED_ID]: followedUser() } },
    } as never,
    services: services as never,
    reducer: combineReducers({ feed: feedReducer, storedSessions: storedSessionsReducer }),
  });

  addFeedItemEffects(testBed.addEffect);
  return testBed;
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
});
