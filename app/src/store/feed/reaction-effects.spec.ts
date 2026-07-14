import { describe, expect, it, vi } from 'vitest';
import { combineReducers } from '@reduxjs/toolkit';
import { Instant, LocalDate } from '@js-joda/core';
import { createAddEffectTestBed } from '@/utils/__test__/add-effect-testbed';
import { addReactionEffects } from '@/store/feed/reaction-effects';
import feedReducer, { cheerFeedItem } from '@/store/feed';
import { FeedIdentity, FollowedFeedUser, Reaction, SessionUserEvent } from '@/models/feed-models';
import { RemoteData } from '@/models/remote';
import { AesKey, RsaPublicKey } from '@/models/encryption-models';
import { ApiErrorType, ApiResult } from '@/services/api-error';
import { Session } from '@/models/session-models';
import { SessionBlueprint } from '@/models/blueprint-models';

const AUTHOR_ID = 'author-1';
const EVENT_ID = 'event-1';

const identity = { id: 'me' } as FeedIdentity;
const publicKey: RsaPublicKey = { spkiPublicKeyBytes: new Uint8Array([1]) };

function author() {
  return new FollowedFeedUser(AUTHOR_ID, publicKey, 'Alice', undefined, {} as AesKey, 'secret');
}

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

function makeTestBed() {
  const services = {
    feedFollowService: {
      sendReactionAsync: vi.fn().mockResolvedValue(ApiResult.success()),
    },
  };

  const testBed = createAddEffectTestBed({
    initialState: {
      feed: {
        identity: RemoteData.success(identity),
        feed: [feedEvent()],
        followedUsers: { [AUTHOR_ID]: author() },
      },
    } as never,
    services: services as never,
    reducer: combineReducers({ feed: feedReducer }),
  });

  addReactionEffects(testBed.addEffect);
  return { testBed, services };
}

function sentReactions(testBed: ReturnType<typeof makeTestBed>['testBed']) {
  return Object.values(testBed.getState().feed.sentReactions);
}

function sentPayloads(services: ReturnType<typeof makeTestBed>['services']): Reaction[] {
  return services.feedFollowService.sendReactionAsync.mock.calls.map((call) => call[2] as Reaction);
}

describe('reaction-effects', () => {
  it('sends a single cheer', async () => {
    vi.useFakeTimers();
    const { testBed, services } = makeTestBed();

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
    const { testBed, services } = makeTestBed();

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
    const { testBed, services } = makeTestBed();

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
    const { testBed } = makeTestBed();

    const dispatched = testBed.dispatchHandled(cheerFeedItem({ eventId: EVENT_ID, emoji: '🔥', fromUserAction: true }));

    // Optimistic: the row exists while the batch window is still open.
    expect(sentReactions(testBed)).toHaveLength(1);

    await vi.advanceTimersByTimeAsync(1500);
    await dispatched;
    vi.useRealTimers();
  });

  it('rolls the cheer back when sending fails', async () => {
    vi.useFakeTimers();
    const { testBed, services } = makeTestBed();
    services.feedFollowService.sendReactionAsync.mockResolvedValue(
      ApiResult.fromError({ type: ApiErrorType.Unknown, message: 'boom', exception: undefined }),
    );

    const dispatched = testBed.dispatchHandled(cheerFeedItem({ eventId: EVENT_ID, emoji: '💪', fromUserAction: true }));
    await vi.advanceTimersByTimeAsync(1500);
    await dispatched;

    expect(sentReactions(testBed)).toHaveLength(0);
    vi.useRealTimers();
  });

  it('drops a cheer for an event whose author is not followed', async () => {
    vi.useFakeTimers();
    const { testBed, services } = makeTestBed();

    const dispatched = testBed.dispatchHandled(
      cheerFeedItem({ eventId: 'unknown-event', emoji: '💪', fromUserAction: true }),
    );
    await vi.advanceTimersByTimeAsync(1500);
    await dispatched;

    expect(services.feedFollowService.sendReactionAsync).not.toHaveBeenCalled();
    expect(sentReactions(testBed)).toHaveLength(0);
    vi.useRealTimers();
  });
});
