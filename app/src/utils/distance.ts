import { Distance } from '@/models/blueprint-models';
import { localeDisplayFormatBigNumber } from '@/utils/locale-bignumber';
import { getShortUnit } from '@/utils/unit';

export function formatDistance(distance: Distance) {
  return `${localeDisplayFormatBigNumber(distance.value)}${getShortUnit(distance.unit)}`;
}
