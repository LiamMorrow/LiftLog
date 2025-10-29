import { Distance } from '@/models/blueprint-models';
import { localeFormatBigNumber } from '@/utils/locale-bignumber';
import { getShortUnit } from '@/utils/unit';

export function formatDistance(distance: Distance) {
  return `${localeFormatBigNumber(distance.value)}${getShortUnit(distance.unit)}`;
}
