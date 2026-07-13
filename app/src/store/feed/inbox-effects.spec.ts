import { describe, expect, it, vi } from 'vitest';
import { combineReducers } from '@reduxjs/toolkit';
import { Instant, LocalDate } from '@js-joda/core';
import { createAddEffectTestBed } from '@/utils/__test__/add-effect-testbed';
import { addInboxEffects } from '@/store/feed/inbox-effects';
import feedReducer, { fetchInboxItems, upsertReceivedReactions } from '@/store/feed';
import { storedSessionsReducer } from '@/store/stored-sessions';
import {
  FeedIdentity,
  FollowerFeedUser,
  MAX_REACTIONS_PER_SENDER_PER_EVENT,
  Reaction,
  ReactionInboxMessage,
  ReceivedReaction,
} from '@/models/feed-models';
import { RemoteData } from '@/models/remote';
import { RsaPublicKey } from '@/models/encryption-models';
import { ApiResult } from '@/services/api-error';
import { Session } from '@/models/session-models';
import { SessionBlueprint } from '@/models/blueprint-models';

// ─── Fixtures ───────────────────────────────────────────────────────────────

const OWN_SESSION_ID = 'session-1';
const FOLLOWER_ID = 'follower-1';

const identity = { id: 'me', password: 'pw' } as FeedIdentity;
const publicKey: RsaPublicKey = { spkiPublicKeyBytes: new Uint8Array([1]) };

function ownSession(): Session {
  return new Session(
    OWN_SESSION_ID,
    new SessionBlueprint('Push', [], ''),
    [],
    LocalDate.of(2026, 7, 13),
    undefined,
    undefined,
  );
}

function cheer(overrides?: { senderUserId?: string; eventId?: string; reactionId?: string; count?: number }) {
  return new ReactionInboxMessage(
    overrides?.senderUserId ?? FOLLOWER_ID,
    new Uint8Array(),
    new Reaction(
      overrides?.reactionId ?? 'reaction-1',
      overrides?.eventId ?? OWN_SESSION_ID,
      '💪',
      overrides?.count ?? 1,
      Instant.parse('2026-07-13T10:00:00Z'),
    ),
  );
}

function makeTestBed(options?: {
  followers?: Record<string, FollowerFeedUser>;
  receivedReactions?: Record<string, ReceivedReaction>;
  sessions?: Record<string, Session>;
}) {
  const services = {
    feedApiService: {
      getInboxMessagesAsync: vi.fn().mockResolvedValue(ApiResult.success({ inboxMessages: [{}] })),
    },
    feedInboxDecryptionService: {
      decryptIfValid: vi.fn(),
    },
  };

  const testBed = createAddEffectTestBed({
    initialState: {
      feed: {
        identity: RemoteData.success(identity),
        followers: options?.followers ?? { [FOLLOWER_ID]: new FollowerFeedUser(FOLLOWER_ID, publicKey, 'Bob', 's') },
        receivedReactions: options?.receivedReactions ?? {},
      },
      storedSessions: {
        sessions: options?.sessions ?? { [OWN_SESSION_ID]: ownSession() },
      },
    } as never,
    services: services as never,
    reducer: combineReducers({ feed: feedReducer, storedSessions: storedSessionsReducer }),
  });

  addInboxEffects(testBed.addEffect);
  return { testBed, services };
}

/** The decryption service is what yields InboxMessages; stub it to return exactly these. */
function deliver(services: ReturnType<typeof makeTestBed>['services'], messages: ReactionInboxMessage[]) {
  services.feedApiService.getInboxMessagesAsync.mockResolvedValue(
    ApiResult.success({ inboxMessages: messages.map(() => ({})) }),
  );
  let index = 0;
  services.feedInboxDecryptionService.decryptIfValid.mockImplementation(() =>
    Promise.resolve(messages[index++] ?? null),
  );
}

function acceptedReactions(testBed: ReturnType<typeof makeTestBed>['testBed']): ReceivedReaction[] {
  return Object.values(testBed.getState().feed.receivedReactions);
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('inbox-effects reactions', () => {
  it('accepts a cheer from a follower on a session you own', async () => {
    const { testBed, services } = makeTestBed();
    deliver(services, [cheer({ count: 5 })]);

    await testBed.dispatchHandled(fetchInboxItems({ fromUserAction: true }));

    const accepted = acceptedReactions(testBed);
    expect(accepted).toHaveLength(1);
    expect(accepted[0]!.count).toBe(5);
    expect(accepted[0]!.fromUserId).toBe(FOLLOWER_ID);
  });

  it('drops a cheer from someone who is not a follower', async () => {
    // PUT /inbox is unauthenticated, so any stranger who knows the user id can post one of these.
    const { testBed, services } = makeTestBed({ followers: {} });
    deliver(services, [cheer()]);

    await testBed.dispatchHandled(fetchInboxItems({ fromUserAction: true }));

    expect(acceptedReactions(testBed)).toHaveLength(0);
  });

  it('drops a cheer targeting a session you do not own', async () => {
    const { testBed, services } = makeTestBed();
    deliver(services, [cheer({ eventId: 'someone-elses-session' })]);

    await testBed.dispatchHandled(fetchInboxItems({ fromUserAction: true }));

    expect(acceptedReactions(testBed)).toHaveLength(0);
  });

  it('does not double count a redelivered cheer', async () => {
    const { testBed, services } = makeTestBed();
    deliver(services, [cheer({ reactionId: 'r1', count: 3 }), cheer({ reactionId: 'r1', count: 3 })]);

    await testBed.dispatchHandled(fetchInboxItems({ fromUserAction: true }));

    const accepted = acceptedReactions(testBed);
    expect(accepted).toHaveLength(1);
    expect(accepted[0]!.count).toBe(3);
  });

  it('caps how many cheers one sender can store against a single event', async () => {
    const { testBed, services } = makeTestBed();
    const flood = Array.from({ length: MAX_REACTIONS_PER_SENDER_PER_EVENT + 10 }, (_, i) =>
      cheer({ reactionId: `r${i}` }),
    );
    deliver(services, flood);

    await testBed.dispatchHandled(fetchInboxItems({ fromUserAction: true }));

    expect(acceptedReactions(testBed)).toHaveLength(MAX_REACTIONS_PER_SENDER_PER_EVENT);
  });

  it('persists cheers before doing anything else, since the server has already deleted them', async () => {
    const { testBed, services } = makeTestBed();
    deliver(services, [cheer()]);

    await testBed.dispatchHandled(fetchInboxItems({ fromUserAction: true }));

    const dispatched = testBed.dispatchedActions.map((x) => x.type);
    expect(dispatched).toContain(upsertReceivedReactions.type);
  });
});
