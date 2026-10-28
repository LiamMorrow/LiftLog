import { describe, expect, it, vi } from 'vitest';
import { combineReducers } from '@reduxjs/toolkit';
import { Instant, LocalDate } from '@js-joda/core';
import { createAddEffectTestBed } from '@/utils/__test__/add-effect-testbed';
import { addReactionEffects } from '@/store/feed/reaction-effects';
import feedReducer, { cheerFeedItem, flushOutbox, setSentReaction } from '@/store/feed';
import { FeedIdentity, MAX_REACTION_COUNT, Reaction, SentReaction, SessionUserEvent } from '@/models/feed-models';
import { makeFriend } from '@/store/feed/__test__/friends';
import { RemoteData } from '@/models/remote';
import { createTestDb } from '@/utils/__test__/test-db';
import { feedOutboxSchema } from '@/db/schema';
import { InboxRecipient } from '@/services/feed-follow-service';
import { Session } from '@/models/session-models';
import { SessionBlueprint } from '@/models/blueprint-models';

const AUTHOR_ID = 'author-1';
const EVENT_ID = 'event-1';

const identity = { id: 'me' } as FeedIdentity;

function feedEvent() {
  const session = new Session(
    'their-session',
    new SessionBlueprint('Push', [], ''),
    [],
    LocalDate.of(2026, 7, 13),
    undefined,
    undefined,
  );
  return new SessionUserEvent(AUTHOR_ID, EVENT_ID, Instant.now(), Instant.now().plusSeconds(60), session);
}

async function makeTestBed() {
  const services = {
    feedFollowService: {
      reactionMessage: vi.fn((_: FeedIdentity, recipient: InboxRecipient, reaction: Reaction) =>
        Promise.resolve({
          messageId: reaction.reactionId,
          recipientId: recipient.id,
          type: 'Reaction' as const,
          encryptedMessage: [new Uint8Array([1])],
        }),
      ),
    },
  };
  const db = await createTestDb();

  const testBed = createAddEffectTestBed({
    initialState: {
      feed: {
        identity: RemoteData.success(identity),
        feed: [feedEvent()],
        friends: { [AUTHOR_ID]: makeFriend(AUTHOR_ID) },
      },
    },
    services: { ...services, db },
    reducer: combineReducers({ feed: feedReducer }),
  });

  addReactionEffects(testBed.addEffect);
  return { testBed, services, db };
}

type TestBed = Awaited<ReturnType<typeof makeTestBed>>;

function sentReactions(testBed: TestBed['testBed']) {
  return Object.values(testBed.getState().feed.sentReactions);
}

function sentPayloads(services: TestBed['services']): Reaction[] {
  return services.feedFollowService.reactionMessage.mock.calls.map((call) => call[2]);
}

describe('reaction-effects', () => {
  it('sends a single cheer', async () => {
    vi.useFakeTimers();
    const { testBed, services } = await makeTestBed();

    const dispatched = testBed.dispatchHandled(cheerFeedItem({ eventId: EVENT_ID, emoji: '💪', fromUserAction: true }));
    await vi.advanceTimersByTimeAsync(1500);
    await dispatched;

    const payloads = sentPayloads(services);
    expect(payloads).toHaveLength(1);
    expect(payloads[0]!.count).toBe(1);
    expect(payloads[0]!.emoji).toBe('💪');
    vi.useRealTimers();
  });

  it('coalesces a flurry of taps into one message carrying the count', async () => {
    // Each message is an RSA encryption and a PUT, so ten taps must not become ten of them.
    vi.useFakeTimers();
    const { testBed, services } = await makeTestBed();

    const taps = Array.from({ length: 5 }, () =>
      testBed.dispatchHandled(cheerFeedItem({ eventId: EVENT_ID, emoji: '💪', fromUserAction: true })),
    );
    await vi.advanceTimersByTimeAsync(1500);
    await Promise.all(taps);

    const payloads = sentPayloads(services);
    expect(payloads).toHaveLength(1);
    expect(payloads[0]!.count).toBe(5);
    vi.useRealTimers();
  });

  it('sends different emoji as separate cheers', async () => {
    vi.useFakeTimers();
    const { testBed, services } = await makeTestBed();

    const taps = [
      testBed.dispatchHandled(cheerFeedItem({ eventId: EVENT_ID, emoji: '💪', fromUserAction: true })),
      testBed.dispatchHandled(cheerFeedItem({ eventId: EVENT_ID, emoji: '🔥', fromUserAction: true })),
    ];
    await vi.advanceTimersByTimeAsync(1500);
    await Promise.all(taps);

    const emojis = sentPayloads(services).map((x) => x.emoji);
    expect(emojis).toHaveLength(2);
    expect(new Set(emojis)).toEqual(new Set(['💪', '🔥']));
    vi.useRealTimers();
  });

  it('shows the cheer immediately, before the network call', async () => {
    vi.useFakeTimers();
    const { testBed } = await makeTestBed();

    const dispatched = testBed.dispatchHandled(cheerFeedItem({ eventId: EVENT_ID, emoji: '🔥', fromUserAction: true }));

    // Optimistic: the row exists while the batch window is still open.
    expect(sentReactions(testBed)).toHaveLength(1);

    await vi.advanceTimersByTimeAsync(1500);
    await dispatched;
    vi.useRealTimers();
  });

  it('queues the cheer for delivery and asks the outbox to flush', async () => {
    vi.useFakeTimers();
    const { testBed, db } = await makeTestBed();

    const dispatched = testBed.dispatchHandled(cheerFeedItem({ eventId: EVENT_ID, emoji: '💪', fromUserAction: true }));
    await vi.advanceTimersByTimeAsync(1500);
    await dispatched;

    expect(
      db
        .select()
        .from(feedOutboxSchema)
        .all()
        .map((x) => x.recipientId),
    ).toEqual([AUTHOR_ID]);
    expect(testBed.dispatchedActions.map((x) => x.type)).toContain(flushOutbox.type);
    expect(sentReactions(testBed)).toHaveLength(1);
    vi.useRealTimers();
  });

  it('rolls the cheer back when it cannot be encrypted', async () => {
    vi.useFakeTimers();
    const { testBed, services } = await makeTestBed();
    services.feedFollowService.reactionMessage.mockRejectedValue(new Error('bad key'));

    const dispatched = testBed.dispatchHandled(cheerFeedItem({ eventId: EVENT_ID, emoji: '💪', fromUserAction: true }));
    await vi.advanceTimersByTimeAsync(1500);
    await dispatched;

    expect(sentReactions(testBed)).toHaveLength(0);
    vi.useRealTimers();
  });

  it('keeps one running total per emoji, under one id, across bursts', async () => {
    vi.useFakeTimers();
    const { testBed, services } = await makeTestBed();

    for (const taps of [2, 3]) {
      const burst = Array.from({ length: taps }, () =>
        testBed.dispatchHandled(cheerFeedItem({ eventId: EVENT_ID, emoji: '💪', fromUserAction: true })),
      );
      await vi.advanceTimersByTimeAsync(1500);
      await Promise.all(burst);
    }

    const payloads = sentPayloads(services);
    expect(payloads.map((x) => x.count)).toEqual([2, 5]);
    expect(new Set(payloads.map((x) => x.reactionId)).size).toBe(1);
    expect(sentReactions(testBed).map((x) => x.count)).toEqual([5]);
    vi.useRealTimers();
  });

  it('stops counting at the most one cheer can carry', async () => {
    vi.useFakeTimers();
    const { testBed, services } = await makeTestBed();
    testBed.dispatch(setSentReaction(new SentReaction('r1', EVENT_ID, '💪', MAX_REACTION_COUNT, Instant.now())));

    const dispatched = testBed.dispatchHandled(cheerFeedItem({ eventId: EVENT_ID, emoji: '💪', fromUserAction: true }));
    await vi.advanceTimersByTimeAsync(1500);
    await dispatched;

    expect(services.feedFollowService.reactionMessage).not.toHaveBeenCalled();
    expect(sentReactions(testBed).map((x) => x.count)).toEqual([MAX_REACTION_COUNT]);
    vi.useRealTimers();
  });

  it('rolls a running total back to what was sent before when it cannot be encrypted', async () => {
    vi.useFakeTimers();
    const { testBed, services } = await makeTestBed();
    testBed.dispatch(setSentReaction(new SentReaction('r1', EVENT_ID, '💪', 4, Instant.now())));
    services.feedFollowService.reactionMessage.mockRejectedValue(new Error('bad key'));

    const dispatched = testBed.dispatchHandled(cheerFeedItem({ eventId: EVENT_ID, emoji: '💪', fromUserAction: true }));
    await vi.advanceTimersByTimeAsync(1500);
    await dispatched;

    expect(sentReactions(testBed).map((x) => [x.id, x.count])).toEqual([['r1', 4]]);
    vi.useRealTimers();
  });

  it('drops a cheer for an event whose author is not followed', async () => {
    vi.useFakeTimers();
    const { testBed, services } = await makeTestBed();

    const dispatched = testBed.dispatchHandled(
      cheerFeedItem({ eventId: 'unknown-event', emoji: '💪', fromUserAction: true }),
    );
    await vi.advanceTimersByTimeAsync(1500);
    await dispatched;

    expect(services.feedFollowService.reactionMessage).not.toHaveBeenCalled();
    expect(sentReactions(testBed)).toHaveLength(0);
    vi.useRealTimers();
  });
});
