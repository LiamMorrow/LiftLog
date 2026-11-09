import { renderHook } from '@testing-library/react';
import BigNumber from 'bignumber.js';
import { describe, expect, it } from 'vitest';
import { useDerivedState } from '@/hooks/useDerivedState';

describe('useDerivedState', () => {
  it('resets to undefined when a BigNumber value is cleared', () => {
    const initialProps: { value: BigNumber | undefined } = { value: new BigNumber(5) };
    const { result, rerender } = renderHook(({ value }) => useDerivedState(value), { initialProps });

    rerender({ value: undefined });

    expect(result.current[0]).toBeUndefined();
  });

  it('keeps diverged state when an equal BigNumber value is passed', () => {
    const { result, rerender } = renderHook(({ value }) => useDerivedState(value, (v) => v.toString()), {
      initialProps: { value: new BigNumber(5) },
    });

    rerender({ value: new BigNumber('5.0') });

    expect(result.current[0]).toBe('5');
  });

  it('derives from a new BigNumber value', () => {
    const { result, rerender } = renderHook(({ value }) => useDerivedState(value, (v) => v.toString()), {
      initialProps: { value: new BigNumber(5) },
    });

    rerender({ value: new BigNumber(7) });

    expect(result.current[0]).toBe('7');
  });
});
