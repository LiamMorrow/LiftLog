export function toRecord<T, TKey extends string | number, TValue>(
  keySelector: (item: T) => TKey,
  value: (item: T) => TValue,
): (accum: Record<TKey, TValue>, item: T) => Record<TKey, TValue> {
  return (accum, item) => {
    accum[keySelector(item)] = value(item);
    return accum;
  };
}
