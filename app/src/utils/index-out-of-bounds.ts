export class IndexOutOfBoundsError extends Error {
  constructor(
    readonly index: number,
    readonly array: unknown[],
  ) {
    super(`Index out of bounds. Index: ${index}. Array length: ${array.length}`);
  }
}
