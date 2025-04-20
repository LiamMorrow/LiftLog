import { LiftLog } from '@/gen/proto.js';
import BigNumber from 'bignumber.js';
import Long from 'long';

const nanoFactor = BigNumber('1000000000');
export function toDecimalDao(
  number: BigNumber,
): LiftLog.Ui.Models.DecimalValue {
  const units = number.integerValue(BigNumber.ROUND_FLOOR);
  const nanos = number
    .minus(BigNumber(units))
    .multipliedBy(nanoFactor)
    .integerValue();
  return new LiftLog.Ui.Models.DecimalValue({
    units: Long.fromString(units.toString()),
    nanos: nanos.toNumber(),
  });
}
