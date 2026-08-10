import { Weight } from '@/models/weight';

export type StatAxis = 'reps' | 'load';

/**
 * The arithmetic a series over time needs of whatever it is plotting, supplied per axis rather than
 * baked into the aggregation.
 */
export interface QuantityOps<T> {
  readonly zero: T;
  plus(a: T, b: T): T;
  isGreaterThan(a: T, b: T): boolean;
  equals(a: T, b: T): boolean;
}

export const loadOps: QuantityOps<Weight> = {
  zero: Weight.NIL,
  plus: (a, b) => a.plus(b),
  isGreaterThan: (a, b) => a.isGreaterThan(b),
  equals: (a, b) => a.equals(b),
};

export const repsOps: QuantityOps<number> = {
  zero: 0,
  plus: (a, b) => a + b,
  isGreaterThan: (a, b) => a > b,
  equals: (a, b) => a === b,
};

export function opsFor(axis: 'load'): QuantityOps<Weight>;
export function opsFor(axis: 'reps'): QuantityOps<number>;
export function opsFor(axis: StatAxis): QuantityOps<Weight> | QuantityOps<number> {
  return axis === 'load' ? loadOps : repsOps;
}
