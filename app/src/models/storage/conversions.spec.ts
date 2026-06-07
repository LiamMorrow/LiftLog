/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import fc from 'fast-check';
import {
  SessionBlueprintGenerator,
  SessionGenerator,
} from '@/models/storage/generators';
import { LiftLog } from '@/gen/proto';
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { gunzipSync } from 'zlib';
import { Weight } from '@/models/weight';
import { SessionBlueprint } from '../blueprint-models';
import { Session } from '../session-models';
import { ProtobufToJsonV1Migrator } from './versions/v1/protobuf-migrator';
import {
  fromJsonString,
  SessionBlueprintJSON,
  SessionJSON,
  toJsonString,
} from '@/models/storage/versions/latest';

const Models = LiftLog.Ui.Models;

const modelToJSON = (x: ToJSON) => x.toJSON();

const sessionBlueprintFromJSON = (
  dao: SessionBlueprintJSON,
): SessionBlueprint => SessionBlueprint.fromJSON(dao);
const sessionFromJSON = (dao: SessionJSON): Session => Session.fromJSON(dao);

describe('conversions', () => {
  describe.each`
    name                  | initialValueGenerator        | convertToJSON  | convertFromJSON             | assertEquals
    ${'SessionBlueprint'} | ${SessionBlueprintGenerator} | ${modelToJSON} | ${sessionBlueprintFromJSON} | ${toJSONEquals}
    ${'Session'}          | ${SessionGenerator}          | ${modelToJSON} | ${sessionFromJSON}          | ${toJSONEquals}
  `(
    'should convert back and forth between $name surviving an encoding',
    ({
      initialValueGenerator,
      convertToJSON,
      convertFromJSON,
      assertEquals,
    }) => {
      it('with protobuf', () => {
        fc.assert(
          fc.property(
            initialValueGenerator as fc.Arbitrary<unknown>,
            (initialValue) => {
              const converted = convertToJSON(initialValue);
              const encoded = toJsonString(converted);
              const convertedBack = convertFromJSON(fromJsonString(encoded));

              assertEquals(initialValue, convertedBack);
            },
          ),
        );
      });
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

interface ToJSON {
  toJSON(): unknown;
}

function toJSONEquals(a: ToJSON, b: ToJSON) {
  expect(b.toJSON()).toEqual(a.toJSON());
}

function fromSessionHistoryDao(
  sessionHistoryModel: LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2,
): Session[] {
  return sessionHistoryModel.completedSessions.map((item) =>
    Session.fromJSON(ProtobufToJsonV1Migrator.migrateSession(item)),
  );
}
