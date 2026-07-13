import { describe, expect, it, vi } from 'vitest';
import { LocalDate } from '@js-joda/core';
import { publishSessionAsync } from '@/store/feed/feed-items-effects';
import { FeedIdentity, FEED_EVENT_RETENTION_SECONDS } from '@/models/feed-models';
import { Session } from '@/models/session-models';
import { SessionBlueprint } from '@/models/blueprint-models';
import { Weight } from '@/models/weight';
import { AesKey, RsaKeyPair } from '@/models/encryption-models';
import { ApiResult } from '@/services/api-error';
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
