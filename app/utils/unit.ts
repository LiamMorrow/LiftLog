import { DistanceUnit } from '@/models/blueprint-models';
import { match } from 'ts-pattern';

export function getShortUnit(unit: DistanceUnit): string {
  return match(unit)
    .with('metre', () => 'm')
    .with('kilometre', () => 'km')
    .with('mile', () => 'mi')
    .with('yard', () => 'yd')
    .exhaustive();
}
