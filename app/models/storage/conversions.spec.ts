/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  toDecimalDao,
  toDateOnlyDao,
  toTimeOnlyDao,
  toSessionBlueprintDao,
  toSessionDao,
  toFeedIdentityDao,
  toFeedUserDao,
  toDurationDao,
  toFeedItemDao,
  toTimestampDao,
} from '@/models/storage/conversions.to-dao';
import {
  fromDecimalDao,
  fromDateOnlyDao,
  fromTimeOnlyDao,
  fromSessionBlueprintDao,
  fromSessionDao,
  fromFeedIdentityDao,
  fromFeedUserDao,
  fromSessionHistoryDao,
  fromDurationDao,
  fromFeedItemDao,
  fromTimestampDao,
} from '@/models/storage/conversions.from-dao';
import BigNumber from 'bignumber.js';
import fc from 'fast-check';
import { Duration, Instant, LocalDate, LocalTime } from '@js-joda/core';
import {
  BigNumberGenerator,
  DurationGenerator,
  FeedIdentityGenerator,
  FeedUserGenerator,
  InstantGenerator,
  LocalDateGenerator,
  LocalTimeGenerator,
  SessionBlueprintGenerator,
  SessionFeedItemGenerator,
  SessionGenerator,
} from '@/models/storage/generators';
import { google, LiftLog } from '@/gen/proto';
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { gunzipSync } from 'zlib';
import { Weight } from '@/models/weight';

const Models = LiftLog.Ui.Models;

describe('conversions', () => {
  it.each`
    name                  | protoType                                           | initialValueGenerator        | convertToDao             | convertFromDao             | assertEquals
    ${'Decimal'}          | ${Models.DecimalValue}                              | ${BigNumberGenerator}        | ${toDecimalDao}          | ${fromDecimalDao}          | ${(a: BigNumber, b: BigNumber) => expect(a.isEqualTo(b)).toBeTruthy()}
    ${'DateOnly'}         | ${Models.DateOnlyDao}                               | ${LocalDateGenerator}        | ${toDateOnlyDao}         | ${fromDateOnlyDao}         | ${(a: LocalDate, b: LocalDate) => expect(a.equals(b)).toBeTruthy()}
    ${'Duration'}         | ${google.protobuf.Duration}                         | ${DurationGenerator}         | ${toDurationDao}         | ${fromDurationDao}         | ${(a: Duration, b: Duration) => expect(a.equals(b)).toBeTruthy()}
    ${'TimeOnly'}         | ${Models.TimeOnlyDao}                               | ${LocalTimeGenerator}        | ${toTimeOnlyDao}         | ${fromTimeOnlyDao}         | ${(a: LocalTime, b: LocalTime) => expect(a.equals(b)).toBeTruthy()}
    ${'SessionBlueprint'} | ${Models.SessionBlueprintDao.SessionBlueprintDaoV2} | ${SessionBlueprintGenerator} | ${toSessionBlueprintDao} | ${fromSessionBlueprintDao} | ${toPOJOEquals}
    ${'Session'}          | ${Models.SessionHistoryDao.SessionDaoV2}            | ${SessionGenerator}          | ${toSessionDao}          | ${fromSessionDao}          | ${toPOJOEquals}
    ${'FeedIdentity'}     | ${Models.FeedIdentityDaoV1}                         | ${FeedIdentityGenerator}     | ${toFeedIdentityDao}     | ${fromFeedIdentityDao}     | ${toPOJOEquals}
    ${'FeedUser'}         | ${Models.FeedUserDaoV1}                             | ${FeedUserGenerator}         | ${toFeedUserDao}         | ${fromFeedUserDao}         | ${toPOJOEquals}
    ${'SessionFeedItem'}  | ${Models.FeedItemDaoV1}                             | ${SessionFeedItemGenerator}  | ${toFeedItemDao}         | ${fromFeedItemDao}         | ${toPOJOEquals}
    ${'Timestamp'}        | ${google.protobuf.Timestamp}                        | ${InstantGenerator}          | ${toTimestampDao}        | ${fromTimestampDao}        | ${(a: Instant, b: Instant) => a.equals(b)}
  `(
    'should convert back and forth between $name surviving an encoding',
    ({
      initialValueGenerator,
      protoType,
      convertToDao,
      convertFromDao,
      assertEquals,
    }) => {
      fc.assert(
        fc.property(
          initialValueGenerator as fc.Arbitrary<unknown>,
          (initialValue) => {
            const converted = convertToDao(
              initialValue as fc.Arbitrary<unknown>,
            );
            const encoded = protoType.encode(converted).finish();
            const decoded = protoType.decode(encoded);
            const convertedBack = convertFromDao(decoded);

            assertEquals(initialValue, convertedBack);
          },
        ),
      );
    },
  );

  it('should be able to decode a backup from original liftlog', () => {
    const compressedData = readFileSync(
      __dirname + '/' + 'export.liftlogbackup.gz',
    );
    const decompressed = gunzipSync(compressedData);
    const decoded =
      Models.SessionHistoryDao.SessionHistoryDaoV2.decode(decompressed);
    const sessions = fromSessionHistoryDao(decoded);
    const totalWeightLifted = sessions
      .values()
      .map((x) => x.totalWeightLifted)
      .reduce((a, b) => a.plus(b));
    const bodyweightSum = sessions
      .values()
      .map((x) => x.bodyweight)
      .reduce((a, b) => (a && b ? a.plus(b) : a ? a : b));

    expect(sessions.size).toBe(85);
    // Just some general checksums
    expect(totalWeightLifted).toEqual(new Weight(705959.136, 'nil'));
    expect(bodyweightSum).toEqual(new Weight(3065.3, 'nil'));
  });
});

interface ToPOJO {
  toPOJO(): unknown;
}

function toPOJOEquals(a: ToPOJO, b: ToPOJO) {
  expect(b.toPOJO()).toEqual(a.toPOJO());
}
