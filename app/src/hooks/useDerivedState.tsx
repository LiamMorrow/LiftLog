import { Dispatch, SetStateAction, useState } from 'react';

/**
 * Useful for allowing components to create state that is initially derived from props,
 * but can diverge **until** the props value changes again, then it brings it back.
 */
export function useDerivedState<T, TValue>(
  value: T,
  deriveValue: (v: T) => TValue,
): [TValue, Dispatch<SetStateAction<TValue>>];
export function useDerivedState<T>(value: T): [T, Dispatch<SetStateAction<T>>];
export function useDerivedState<T, TValue>(
  value: T,
  deriveValue?: (v: T) => TValue,
): [TValue, Dispatch<SetStateAction<TValue>>] {
  const [previousValue, setPreviousValue] = useState(value);
  deriveValue ??= (x) => x as unknown as TValue;
  const [refreshedValue, setRefreshedValue] = useState(() => deriveValue(value));
  if (!isEqual(previousValue, value)) {
    setPreviousValue(value);
    setRefreshedValue(deriveValue(value));
  }
  return [refreshedValue, setRefreshedValue];
}

function isEqual<T>(a: T, b: T): boolean {
  if (a === b) {
    return true;
  }
  if (typeof a === 'object' && a && 'isEqualTo' in a && typeof a.isEqualTo === 'function') {
    // oxlint-disable-next-line typescript/no-unsafe-return typescript/no-unsafe-call
    return (a.isEqualTo as any)(b);
  }
  if (typeof a === 'object' && a && 'equals' in a && typeof a.equals === 'function') {
    // oxlint-disable-next-line typescript/no-unsafe-return typescript/no-unsafe-call
    return (a.equals as any)(b);
  }
  return a === b;
}
