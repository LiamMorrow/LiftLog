import { toDecimalDao } from '@/models/storage/conversions-to-dao.js';
import { fromDecimalDao } from '@/models/storage/conversions.from-dao.js';
import BigNumber from 'bignumber.js';

describe('conversions', () => {
  it.each`
    name         | initialValue         | convertToDao    | convertFromDao    | equals
--                                          | -- | -- | -- | --
    ${'Decimal'} | ${BigNumber('1.23')} | ${toDecimalDao} | ${fromDecimalDao} | ${(a: BigNumber, b: BigNumber) => a.isEqualTo(b)}
  `(
    'should convert back and forth between $name',
    ({ initialValue, convertToDao, convertFromDao, equals }) => {
      const converted = convertToDao(initialValue);
      const convertedBack = convertFromDao(converted);

      const isEqualAfterConversion = equals(initialValue, convertedBack);

      if (!isEqualAfterConversion) {
        fail(
          `Expected round trip conversion to be equivalent
          ----
          converted: ${convertedBack}
          ----
          Back:${convertedBack}`,
        );
      }
    },
  );
});
