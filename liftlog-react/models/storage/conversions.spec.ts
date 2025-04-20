import {
  toDecimalDao,
  toDateOnlyDao,
  toTimeOnlyDao,
  toSessionBlueprintDao,
  toSessionDao,
  toFeedIdentityDao,
  toFeedUserDao,
} from '@/models/storage/conversions.to-dao';
import {
  fromDecimalDao,
  fromDateOnlyDao,
  fromTimeOnlyDao,
  fromSessionBlueprintDao,
  fromSessionDao,
  fromFeedIdentityDao,
  fromFeedUserDao,
} from '@/models/storage/conversions.from-dao';
import BigNumber from 'bignumber.js';
import fc from 'fast-check';
import { LocalDate, LocalTime } from '@js-joda/core';
import {
  BigNumberGenerator,
  FeedIdentityGenerator,
  FeedUserGenerator,
  LocalDateGenerator,
  LocalTimeGenerator,
  SessionBlueprintGenerator,
  SessionGenerator,
} from '@/models/storage/generators';

describe('conversions', () => {
  it.each`
    name                  | initialValueGenerator        | convertToDao             | convertFromDao             | assertEquals
    ${'Decimal'}          | ${BigNumberGenerator}        | ${toDecimalDao}          | ${fromDecimalDao}          | ${(a: BigNumber, b: BigNumber) => expect(a.isEqualTo(b)).toBeTruthy()}
    ${'DateOnly'}         | ${LocalDateGenerator}        | ${toDateOnlyDao}         | ${fromDateOnlyDao}         | ${(a: LocalDate, b: LocalDate) => expect(a.equals(b)).toBeTruthy()}
    ${'TimeOnly'}         | ${LocalTimeGenerator}        | ${toTimeOnlyDao}         | ${fromTimeOnlyDao}         | ${(a: LocalTime, b: LocalTime) => expect(a.equals(b)).toBeTruthy()}
    ${'SessionBlueprint'} | ${SessionBlueprintGenerator} | ${toSessionBlueprintDao} | ${fromSessionBlueprintDao} | ${toPOJOEquals}
    ${'Session'}          | ${SessionGenerator}          | ${toSessionDao}          | ${fromSessionDao}          | ${toPOJOEquals}
    ${'FeedIdentity'}     | ${FeedIdentityGenerator}     | ${toFeedIdentityDao}     | ${fromFeedIdentityDao}     | ${toPOJOEquals}
    ${'FeedUser'}         | ${FeedUserGenerator}         | ${toFeedUserDao}         | ${fromFeedUserDao}         | ${toPOJOEquals}
  `(
    'should convert back and forth between $name',
    ({ initialValueGenerator, convertToDao, convertFromDao, assertEquals }) => {
      fc.assert(
        fc.property(
          initialValueGenerator as fc.Arbitrary<unknown>,
          (initialValue) => {
            const converted = convertToDao(
              initialValue as fc.Arbitrary<unknown>,
            );
            const convertedBack = convertFromDao(converted);

            assertEquals(initialValue, convertedBack);
          },
        ),
      );
    },
  );
});

interface ToPOJO {
  toPOJO(): unknown;
}
function toPOJOEquals(a: ToPOJO, b: ToPOJO) {
  expect(b.toPOJO()).toEqual(a.toPOJO());
}
