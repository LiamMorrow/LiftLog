/**
 * Extracts numeric indices from a tuple type's keys.
 *
 * TypeScript's `keyof` on a tuple includes `"0"`, `"1"`, etc. as string literals
 * alongside non-numeric keys like `"length"` and array methods. This utility
 * filters to only the numeric indices and converts them to `number` subtypes.
 *
 * @typeParam T - A readonly tuple type
 *
 * @example
 * type Steps = readonly [string, number, boolean];
 * type Idx = TupleIndices<Steps>; // 0 | 1 | 2
 */
export type TupleIndices<T extends readonly any[]> =
  Extract<keyof T, `${number}`> extends `${infer N extends number}` ? N : never;
