import { describe, expect, it, vi } from 'vitest';
import { combineReducers } from '@reduxjs/toolkit';
import { Instant, LocalDate } from '@js-joda/core';
import { createAddEffectTestBed } from '@/utils/__test__/add-effect-testbed';
import { createTestDb } from '@/utils/__test__/test-db';
import { addInboxEffects, INBOX_SEEN_RETENTION_MS } from '@/store/feed/inbox-effects';
import feedReducer, { fetchInboxItems, setFollowRequests, setIdentity, upsertReceivedReactions } from '@/store/feed';
import {
  FeedIdentity,
  FollowerFeedUser,
  FollowRequest,
  FollowRequestInboxMessage,
  InboxMessage,
  MAX_REACTIONS_PER_SENDER_PER_EVENT,
  Reaction,
  ReactionInboxMessage,
  ReceivedReaction,
} from '@/models/feed-models';
import { RemoteData } from '@/models/remote';
import { RsaPublicKey } from '@/models/encryption-models';
import { ApiErrorType, ApiResult } from '@/services/api-error';
import { Session } from '@/models/session-models';
import { SessionBlueprint } from '@/models/blueprint-models';
import { DecryptedInboxMessage } from '@/services/feed-inbox-decryption-service';
import { feedInboxQueueSchema, feedInboxSeenSchema } from '@/db/schema';

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

function followRequest(senderUserId: string) {
  return new FollowRequestInboxMessage(senderUserId, new Uint8Array(), new FollowRequest(`name-${senderUserId}`));
}

type Delivery = { message: InboxMessage; messageId?: string; sentAtMs?: number; kind?: 'ok' | 'invalid' | 'retry' };

async function makeTestBed(options?: {
  followers?: Record<string, FollowerFeedUser>;
  receivedReactions?: Record<string, ReceivedReaction>;
  sessions?: Session[];
}) {
  const services = {
    feedApiService: {
      getInboxMessagesAsync: vi.fn().mockResolvedValue(ApiResult.success({ inboxMessages: [] })),
      ackInboxMessagesAsync: vi.fn().mockResolvedValue(ApiResult.success()),
    },
    feedInboxDecryptionService: {
      decrypt: vi.fn(),
    },
  };
  const db = await createTestDb(options?.sessions ?? [ownSession()]);

  const testBed = createAddEffectTestBed({
    initialState: {
      feed: {
        identity: RemoteData.success(identity),
        followers: options?.followers ?? { [FOLLOWER_ID]: new FollowerFeedUser(FOLLOWER_ID, publicKey, 'Bob', 's') },
        receivedReactions: options?.receivedReactions ?? {},
      },
    },
    services: { ...services, db },
    reducer: combineReducers({ feed: feedReducer }),
  });

  addInboxEffects(testBed.addEffect);
  return { testBed, services, db };
}

let nextServerId = 0;

/** The decryption service is what classifies server messages; stub it to yield exactly these. */
function deliver(
  services: Awaited<ReturnType<typeof makeTestBed>>['services'],
  deliveries: (Delivery | InboxMessage)[],
) {
  const byServerId = new Map<string, DecryptedInboxMessage>();
  const inboxMessages = deliveries.map((x, index) => {
    const delivery = 'message' in x ? x : { message: x };
    const serverId = `server-${nextServerId++}`;
    const kind = delivery.kind ?? 'ok';
    byServerId.set(
      serverId,
      kind === 'ok'
        ? {
            kind,
            serverId,
            messageId: delivery.messageId ?? `message-${serverId}`,
            sentAtMs: delivery.sentAtMs ?? index,
            json: delivery.message.toJSON(),
          }
        : { kind, serverId },
    );
    return { id: serverId, encryptedMessage: [] };
  });
  services.feedApiService.getInboxMessagesAsync.mockResolvedValue(ApiResult.success({ inboxMessages }));
  services.feedInboxDecryptionService.decrypt.mockImplementation((_: unknown, message: { id: string }) =>
    Promise.resolve(byServerId.get(message.id)),
  );
  return inboxMessages.map((x) => x.id);
}

function acceptedReactions(testBed: Awaited<ReturnType<typeof makeTestBed>>['testBed']): ReceivedReaction[] {
  return Object.values(testBed.getState().feed.receivedReactions);
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('inbox-effects reactions', () => {
  it('accepts a cheer from a follower on a session you own', async () => {
    const { testBed, services } = await makeTestBed();
    deliver(services, [cheer({ count: 5 })]);

    await testBed.dispatchHandled(fetchInboxItems({ fromUserAction: true }));

    const accepted = acceptedReactions(testBed);
    expect(accepted).toHaveLength(1);
    expect(accepted[0]!.count).toBe(5);
    expect(accepted[0]!.fromUserId).toBe(FOLLOWER_ID);
  });

  it('drops a cheer from someone who is not a follower', async () => {
    // PUT /inbox is unauthenticated, so any stranger who knows the user id can post one of these.
    const { testBed, services } = await makeTestBed({ followers: {} });
    deliver(services, [cheer()]);

    await testBed.dispatchHandled(fetchInboxItems({ fromUserAction: true }));

    expect(acceptedReactions(testBed)).toHaveLength(0);
  });

  it('drops a cheer targeting a session you do not own', async () => {
    const { testBed, services } = await makeTestBed();
    deliver(services, [cheer({ eventId: 'someone-elses-session' })]);

    await testBed.dispatchHandled(fetchInboxItems({ fromUserAction: true }));

    expect(acceptedReactions(testBed)).toHaveLength(0);
  });

  it('does not double count a redelivered cheer', async () => {
    const { testBed, services } = await makeTestBed();
    deliver(services, [cheer({ reactionId: 'r1', count: 3 }), cheer({ reactionId: 'r1', count: 3 })]);

    await testBed.dispatchHandled(fetchInboxItems({ fromUserAction: true }));

    const accepted = acceptedReactions(testBed);
    expect(accepted).toHaveLength(1);
    expect(accepted[0]!.count).toBe(3);
  });

  it('caps how many cheers one sender can store against a single event', async () => {
    const { testBed, services } = await makeTestBed();
    const flood = Array.from({ length: MAX_REACTIONS_PER_SENDER_PER_EVENT + 10 }, (_, i) =>
      cheer({ reactionId: `r${i}` }),
    );
    deliver(services, flood);

    await testBed.dispatchHandled(fetchInboxItems({ fromUserAction: true }));

    expect(acceptedReactions(testBed)).toHaveLength(MAX_REACTIONS_PER_SENDER_PER_EVENT);
  });

  it('dispatches accepted cheers so they are persisted', async () => {
    const { testBed, services } = await makeTestBed();
    deliver(services, [cheer()]);

    await testBed.dispatchHandled(fetchInboxItems({ fromUserAction: true }));

    const dispatched = testBed.dispatchedActions.map((x) => x.type);
    expect(dispatched).toContain(upsertReceivedReactions.type);
  });
});

describe('inbox-effects delivery', () => {
  it('asks the server to keep messages until they are acked', async () => {
    const { testBed, services } = await makeTestBed();

    await testBed.dispatchHandled(fetchInboxItems({ fromUserAction: true }));

    expect(services.feedApiService.getInboxMessagesAsync).toHaveBeenCalledWith({
      userId: identity.id,
      password: identity.password,
      manualAck: true,
    });
  });

  it('acks processed and unreadable messages, but leaves ones to retry on the server', async () => {
    const { testBed, services } = await makeTestBed();
    const [ok, invalid] = deliver(services, [
      { message: cheer({ reactionId: 'r1' }) },
      { message: cheer({ reactionId: 'r2' }), kind: 'invalid' },
      { message: cheer({ reactionId: 'r3' }), kind: 'retry' },
    ]);

    await testBed.dispatchHandled(fetchInboxItems({ fromUserAction: true }));

    expect(services.feedApiService.ackInboxMessagesAsync).toHaveBeenCalledWith({
      userId: identity.id,
      password: identity.password,
      ids: [ok, invalid],
    });
    expect(acceptedReactions(testBed).map((x) => x.id)).toEqual(['r1']);
  });

  it('processes a message delivered twice only once', async () => {
    const { testBed, services } = await makeTestBed();
    deliver(services, [{ message: followRequest('alice'), messageId: 'm1' }]);
    await testBed.dispatchHandled(fetchInboxItems({ fromUserAction: true }));
    testBed.dispatch(setFollowRequests([]));

    deliver(services, [{ message: followRequest('alice'), messageId: 'm1' }]);
    await testBed.dispatchHandled(fetchInboxItems({ fromUserAction: true }));

    expect(testBed.getState().feed.followRequests).toEqual([]);
  });

  it('processes messages in the order they were sent', async () => {
    const { testBed, services } = await makeTestBed();
    deliver(services, [
      { message: followRequest('later'), sentAtMs: 2000 },
      { message: followRequest('earlier'), sentAtMs: 1000 },
    ]);

    await testBed.dispatchHandled(fetchInboxItems({ fromUserAction: true }));

    expect(testBed.getState().feed.followRequests.map((x) => x.senderUserId)).toEqual(['earlier', 'later']);
  });

  it('processes messages a previous run queued but never handled', async () => {
    const { testBed, db } = await makeTestBed();
    db.insert(feedInboxQueueSchema)
      .values({ messageId: 'left-over', sentAtMs: 0, payload: followRequest('alice').toJSON() })
      .run();

    await testBed.dispatchHandled(fetchInboxItems({ fromUserAction: true }));

    expect(testBed.getState().feed.followRequests.map((x) => x.senderUserId)).toEqual(['alice']);
    expect(db.select().from(feedInboxQueueSchema).all()).toEqual([]);
  });

  it('still drains the local queue when the server cannot be reached', async () => {
    const { testBed, services, db } = await makeTestBed();
    db.insert(feedInboxQueueSchema)
      .values({ messageId: 'left-over', sentAtMs: 0, payload: followRequest('alice').toJSON() })
      .run();
    services.feedApiService.getInboxMessagesAsync.mockResolvedValue(
      ApiResult.fromError({ type: ApiErrorType.Unknown, message: 'offline', exception: undefined }),
    );

    await testBed.dispatchHandled(fetchInboxItems({ fromUserAction: false }));

    expect(testBed.getState().feed.followRequests.map((x) => x.senderUserId)).toEqual(['alice']);
  });

  it('forgets seen message ids once they are past the retention window', async () => {
    const { testBed, db } = await makeTestBed();
    db.insert(feedInboxSeenSchema)
      .values([
        { messageId: 'old', seenAtMs: Date.now() - INBOX_SEEN_RETENTION_MS - 1000 },
        { messageId: 'recent', seenAtMs: Date.now() },
      ])
      .run();

    await testBed.dispatchHandled(fetchInboxItems({ fromUserAction: true }));

    expect(
      db
        .select()
        .from(feedInboxSeenSchema)
        .all()
        .map((x) => x.messageId),
    ).toEqual(['recent']);
  });

  it('stops without queueing anything when the identity changes mid-poll', async () => {
    const { testBed, services, db } = await makeTestBed();
    deliver(services, [followRequest('alice')]);
    services.feedApiService.getInboxMessagesAsync.mockImplementation(async () => {
      testBed.dispatch(setIdentity(RemoteData.success({ id: 'someone-else', password: 'pw' } as FeedIdentity)));
      return ApiResult.success({ inboxMessages: [{ id: 'server-x', encryptedMessage: [] }] });
    });

    await testBed.dispatchHandled(fetchInboxItems({ fromUserAction: true }));

    expect(services.feedInboxDecryptionService.decrypt).not.toHaveBeenCalled();
    expect(db.select().from(feedInboxQueueSchema).all()).toEqual([]);
  });

  it('runs one poll at a time, and polls again if asked while busy', async () => {
    const { testBed, services } = await makeTestBed();
    let release!: () => void;
    services.feedApiService.getInboxMessagesAsync.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          release = () => resolve(ApiResult.success({ inboxMessages: [] }));
        }),
    );

    const first = testBed.dispatchHandled(fetchInboxItems({ fromUserAction: true }));
    await testBed.dispatchHandled(fetchInboxItems({ fromUserAction: true }));
    expect(services.feedApiService.getInboxMessagesAsync).toHaveBeenCalledTimes(1);

    release();
    await first;

    expect(services.feedApiService.getInboxMessagesAsync).toHaveBeenCalledTimes(2);
  });
});
