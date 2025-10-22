export function isNotNullOrUndefined<T>(val: T | null | undefined): val is T {
  return val !== null && val !== undefined;
}
export function isNotNullOrUndefinedOrFalse<T>(
  val: T | null | undefined | false,
): val is T {
  return val !== null && val !== undefined && val !== false;
}
