export function omit<T, TK extends keyof T>(key: TK, value: T): Omit<T, TK> {
  const newVal = { ...value };
  delete newVal[key];
  return newVal;
}
