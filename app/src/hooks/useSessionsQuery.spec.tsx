import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useSessionsQuery } from '@/hooks/useSessionsQuery';

const screen = { isFocused: true };
const state = { storedSessions: { sessionsRevision: 0 } };
const db = {};

vi.mock('@/components/smart/services-provider', () => ({ useServices: () => ({ db }) }));
vi.mock('@/store', () => ({ useAppSelector: (selector: (s: typeof state) => unknown) => selector(state) }));
vi.mock('expo-router', () => ({ useIsFocused: () => screen.isFocused }));

let idle: Map<number, () => void>;
const runIdleCallbacks = () =>
  act(() => {
    const callbacks = [...idle.values()];
    idle.clear();
    callbacks.forEach((callback) => callback());
  });

beforeEach(() => {
  idle = new Map();
  let next = 0;
  vi.stubGlobal('requestIdleCallback', (callback: () => void) => {
    idle.set(++next, callback);
    return next;
  });
  vi.stubGlobal('cancelIdleCallback', (handle: number) => idle.delete(handle));
  screen.isFocused = true;
  state.storedSessions.sessionsRevision = 0;
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useSessionsQuery', () => {
  it('reads straight away on a focused screen', () => {
    const read = vi.fn(() => 'sessions');

    const { result } = renderHook(() => useSessionsQuery(read, 'key'));

    expect(result.current).toBe('sessions');
    expect(read).toHaveBeenCalledTimes(1);
  });

  it('waits for the JS thread to go idle before reading on a screen that is not focused', () => {
    screen.isFocused = false;
    const read = vi.fn(() => 'sessions');

    const { result } = renderHook(() => useSessionsQuery(read, 'key'));
    expect(result.current).toBeUndefined();
    expect(read).not.toHaveBeenCalled();

    runIdleCallbacks();

    expect(result.current).toBe('sessions');
    expect(read).toHaveBeenCalledTimes(1);
  });

  it('catches an offscreen screen up when idle after a write, rather than when it is next focused', () => {
    screen.isFocused = false;
    let version = 1;
    const { result, rerender } = renderHook(() => useSessionsQuery(() => version, 'key'));
    runIdleCallbacks();

    version = 2;
    state.storedSessions.sessionsRevision = 1;
    rerender();
    expect(result.current).toBe(1);

    runIdleCallbacks();
    expect(result.current).toBe(2);
  });

  it('does not read for a screen that goes away before the thread is idle', () => {
    screen.isFocused = false;
    const read = vi.fn(() => 'sessions');

    const { unmount } = renderHook(() => useSessionsQuery(read, 'key'));
    unmount();
    runIdleCallbacks();

    expect(read).not.toHaveBeenCalled();
  });
});
