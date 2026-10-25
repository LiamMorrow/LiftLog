import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { Instant } from '@js-joda/core';
import { ReceivedReaction } from '@/models/feed-models';
import { useArrivingCheers } from '@/hooks/useArrivingCheers';

const state = { feed: { receivedReactions: {} as Record<string, ReceivedReaction> } };

vi.mock('@/store', () => ({ useAppSelector: (selector: (s: typeof state) => unknown) => selector(state) }));
vi.mock('expo-haptics', () => ({
  impactAsync: vi.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light' },
}));

const SESSION_ID = 'session-1';

function cheer(id: string, { eventId = SESSION_ID, count = 1 }: { eventId?: string; count?: number } = {}) {
  return new ReceivedReaction(id, eventId, 'friend-1', '💪', count, Instant.now());
}

function receive(...reactions: ReceivedReaction[]) {
  state.feed = {
    receivedReactions: {
      ...state.feed.receivedReactions,
      ...Object.fromEntries(reactions.map((x) => [x.id, x])),
    },
  };
}

function shownIds(result: { current: ReturnType<typeof useArrivingCheers> }) {
  return result.current.cheers.map((x) => x.id);
}

beforeEach(() => {
  vi.useFakeTimers();
  state.feed = { receivedReactions: {} };
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useArrivingCheers', () => {
  it('does not replay cheers received before the workout opened', () => {
    receive(cheer('before'));

    const { result } = renderHook(() => useArrivingCheers(SESSION_ID));

    expect(shownIds(result)).toEqual([]);
  });

  it('keeps showing a cheer until it is dismissed', () => {
    const { result, rerender } = renderHook(() => useArrivingCheers(SESSION_ID));

    receive(cheer('c1'));
    rerender();
    act(() => {
      vi.advanceTimersByTime(10 * 60 * 1000);
    });

    expect(shownIds(result)).toEqual(['c1']);
  });

  it('adds cheers that arrive while the banner is showing', () => {
    const { result, rerender } = renderHook(() => useArrivingCheers(SESSION_ID));

    receive(cheer('c1'));
    rerender();
    receive(cheer('c2'));
    rerender();

    expect(shownIds(result)).toEqual(['c1', 'c2']);
  });

  it('only brings the banner back for cheers newer than the dismissal', () => {
    const { result, rerender } = renderHook(() => useArrivingCheers(SESSION_ID));
    receive(cheer('c1'));
    rerender();

    act(() => result.current.dismiss());
    receive(cheer('c1'));
    rerender();
    expect(shownIds(result)).toEqual([]);

    receive(cheer('c2'));
    rerender();
    expect(shownIds(result)).toEqual(['c2']);
  });

  it('shows only the taps added since a running total was last seen', () => {
    receive(cheer('c1', { count: 3 }));
    const { result, rerender } = renderHook(() => useArrivingCheers(SESSION_ID));

    receive(cheer('c1', { count: 5 }));
    rerender();
    expect(result.current.cheers.map((x) => [x.id, x.count])).toEqual([['c1', 2]]);

    act(() => result.current.dismiss());
    receive(cheer('c1', { count: 5 }));
    rerender();
    expect(result.current.cheers).toEqual([]);

    receive(cheer('c1', { count: 9 }));
    rerender();
    expect(result.current.cheers.map((x) => [x.id, x.count])).toEqual([['c1', 4]]);
  });

  it('ignores cheers for other workouts', () => {
    const { result, rerender } = renderHook(() => useArrivingCheers(SESSION_ID));

    receive(cheer('elsewhere', { eventId: 'other-session' }));
    rerender();

    expect(shownIds(result)).toEqual([]);
  });
});
