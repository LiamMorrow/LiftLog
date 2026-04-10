/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  toDurationDao,
  toTimestampDao,
} from '@/models/storage/conversions.to-dao';
import {
  fromDurationDao,
  fromTimestampDao,
} from '@/models/storage/conversions.from-dao';
import fc from 'fast-check';
import { Duration, Instant } from '@js-joda/core';
import {
  DurationGenerator,
  FeedIdentityGenerator,
  FeedUserGenerator,
  InstantGenerator,
  SessionBlueprintGenerator,
  SessionFeedItemGenerator,
  SessionGenerator,
} from '@/models/storage/generators';
import { google, LiftLog } from '@/gen/proto';
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { gunzipSync } from 'zlib';
import { Weight } from '@/models/weight';
import { SessionBlueprint } from '../blueprint-models';
import { Session } from '../session-models';
import { FeedIdentity, FeedUser, SessionFeedItem } from '../feed-models';
import { ProtobufToJsonV1Migrator } from './versions/v1/protobuf-migrator';

const Models = LiftLog.Ui.Models;

interface ToDao {
  toDao(): unknown;
}

const modelToDao = (x: ToDao) => x.toDao();

const sessionBlueprintFromDao = (
  dao: LiftLog.Ui.Models.SessionBlueprintDao.ISessionBlueprintDaoV2,
): SessionBlueprint =>
  SessionBlueprint.fromJSON(
    ProtobufToJsonV1Migrator.migrateSessionBlueprint(dao),
  );
const sessionFromDao = (
  dao: LiftLog.Ui.Models.SessionHistoryDao.ISessionDaoV2,
): Session => Session.fromJSON(ProtobufToJsonV1Migrator.migrateSession(dao));

describe('conversions', () => {
  it.each`
    name                  | protoType                                           | initialValueGenerator        | convertToDao      | convertFromDao             | assertEquals
    ${'Duration'}         | ${google.protobuf.Duration}                         | ${DurationGenerator}         | ${toDurationDao}  | ${fromDurationDao}         | ${(a: Duration, b: Duration) => expect(a.equals(b)).toBeTruthy()}
    ${'SessionBlueprint'} | ${Models.SessionBlueprintDao.SessionBlueprintDaoV2} | ${SessionBlueprintGenerator} | ${modelToDao}     | ${sessionBlueprintFromDao} | ${toPOJOEquals}
    ${'Session'}          | ${Models.SessionHistoryDao.SessionDaoV2}            | ${SessionGenerator}          | ${modelToDao}     | ${sessionFromDao}          | ${toPOJOEquals}
    ${'FeedIdentity'}     | ${Models.FeedIdentityDaoV1}                         | ${FeedIdentityGenerator}     | ${modelToDao}     | ${FeedIdentity.fromDao}    | ${toPOJOEquals}
    ${'FeedUser'}         | ${Models.FeedUserDaoV1}                             | ${FeedUserGenerator}         | ${modelToDao}     | ${FeedUser.fromDao}        | ${toPOJOEquals}
    ${'SessionFeedItem'}  | ${Models.FeedItemDaoV1}                             | ${SessionFeedItemGenerator}  | ${modelToDao}     | ${SessionFeedItem.fromDao} | ${toPOJOEquals}
    ${'Timestamp'}        | ${google.protobuf.Timestamp}                        | ${InstantGenerator}          | ${toTimestampDao} | ${fromTimestampDao}        | ${(a: Instant, b: Instant) => a.equals(b)}
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

    expect(sessions.length).toBe(85);
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

function fromSessionHistoryDao(
  sessionHistoryModel: LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2,
): Session[] {
  return sessionHistoryModel.completedSessions.map((item) =>
    Session.fromJSON(ProtobufToJsonV1Migrator.migrateSession(item)),
  );
}
