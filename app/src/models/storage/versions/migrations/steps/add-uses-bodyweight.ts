/**
 * Adds the `usesBodyweight` flag to a weighted exercise blueprint. Pre-existing
 * exercises are plain weighted movements, so they default to `false`.
 */
export function addUsesBodyweight<T>(ex: T) {
  return {
    ...ex,
    usesBodyweight: false,
  };
}
