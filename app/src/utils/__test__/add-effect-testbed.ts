/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
// test-utils/createAddEffectTestBed.ts

import { expect, onTestFailed, vi } from 'vitest';
import type { AddEffectFn, RootState } from '@/store/store';
import type { Services } from '@/services';
import type { ActionCreatorWithPayload, UnknownAction } from '@reduxjs/toolkit';

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

type EffectEntry = {
  predicate: (action: UnknownAction) => boolean;
  effect: (action: UnknownAction, api: unknown) => Promise<void>;
};

export function createAddEffectTestBed(options?: {
  initialState?: Partial<RootState>;
  services?: DeepPartial<Services>;
}) {
  const effects: EffectEntry[] = [];
  const dispatchedActions: UnknownAction[] = [];
  let state: Partial<RootState> = options?.initialState ?? {};
  const logs: { level: string; args: unknown[] }[] = [];
  const mockServices: Services = {
    logger: {
      error: vi.fn((...args) => logs.push({ level: 'error', args })),
      warn: vi.fn((...args) => logs.push({ level: 'warn', args })),
      info: vi.fn((...args) => logs.push({ level: 'info', args })),
      debug: vi.fn((...args) => logs.push({ level: 'debug', args })),
    },
    ...options?.services,
  } as unknown as Services;

  onTestFailed(() => {
    if (logs.length === 0) return;
    console.log('=== Effect logs ===');
    for (const { level, args } of logs) {
      console[level as 'error' | 'warn' | 'info' | 'debug'](
        `[${level}]`,
        ...args,
      );
    }
  });
  // Mirrors the real addEffect signature
  const addEffect: AddEffectFn = (actionPredicate: any, effect: any) => {
    effects.push({
      predicate: (action) =>
        !actionPredicate ||
        [actionPredicate].flat().some((x: any) => x.type === action.type),
      effect,
    });
  };
  async function dispatchHandled(action: UnknownAction): Promise<void> {
    await runMatchingEffects(action);
  }
  function dispatch(action: UnknownAction): void {
    dispatchedActions.push(action);
  }

  async function runMatchingEffects(action: UnknownAction): Promise<void> {
    const matching = effects.filter((e) => e.predicate(action));
    const failureHandlers: (() => void)[] = [];

    const listenerApi = {
      dispatch: (a: UnknownAction) => {
        dispatchedActions.push(a);
      },
      getState: () => state as RootState,
      originalState: state as RootState,
      stateAfterReduce: state as RootState,
      extra: mockServices,
      signal: new AbortController().signal,
      onFail: (cb: () => void) => failureHandlers.push(cb),
      cancelActiveListeners: vi.fn(),
      throwIfCancelled: vi.fn(),
    };

    for (const entry of matching) {
      try {
        await entry.effect(action, listenerApi);
      } catch (e) {
        mockServices.logger.error(`Effect error for [${action.type}]:`, e);
        for (const h of failureHandlers) h();
      }
    }
  }

  return {
    addEffect,
    dispatch,
    dispatchHandled,
    dispatchedActions,
    expectNotDispatched: <T, TK extends string>(
      act: ActionCreatorWithPayload<T, TK>,
    ) => {
      const action = dispatchedActions.find((x) => x.type === act.type);
      expect(action).toBeUndefined();
    },
    getDispatchedAction: <T, TK extends string>(
      act: ActionCreatorWithPayload<T, TK>,
    ) => {
      const action = dispatchedActions.find((x) => x.type === act.type);

      expect(action).toBeDefined();
      return action! as ReturnType<typeof act>;
    },
    mockServices,
    /** Update state between dispatches if needed */
    setState: (s: Partial<RootState>) => {
      state = { ...state, ...s };
    },
  };
}
