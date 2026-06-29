import { Distance } from '@/models/blueprint-models';
import { match, P } from 'ts-pattern';

type Equality<T extends Equality<T>> = { equals(other: T): boolean };

export function equal<T extends Equality<T>>(a: T | undefined, b: T | undefined) {
  if (a === undefined || b === undefined) {
    return a === b;
  }
  return a.equals(b);
}

export function distanceEqual(a: Distance | undefined, b: Distance | undefined) {
  return match([a, b])
    .with([undefined, undefined], () => true)
    .with([P.nonNullable, P.nonNullable], ([a, b]) => a.unit === b.unit && a.value.isEqualTo(b.value))
    .otherwise(() => false);
}
