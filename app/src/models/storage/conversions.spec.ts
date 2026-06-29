/* eslint-disable @typescript-eslint/no-unsafe-call */

import fc from 'fast-check';
import {
  ProgramBlueprintGenerator,
  SessionBlueprintGenerator,
  SessionGenerator,
  WeightGenerator,
} from '@/models/storage/generators';
import { LiftLog } from '@/gen/proto';
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { gunzipSync } from 'zlib';
import { Weight } from '@/models/weight';
import { ProgramBlueprint, SessionBlueprint } from '../blueprint-models';
import { Session } from '../session-models';
import { ProtobufToJsonV1Migrator } from './versions/initial/protobuf-migrator';
import { fromJsonString, toJsonString } from '@/models/storage/versions/latest';
import { sessionMigrations } from '@/models/storage/versions/migrations/session';

describe('conversions', () => {
  describe.each`
    type                | initialValueGenerator        | assertEquals
    ${SessionBlueprint} | ${SessionBlueprintGenerator} | ${toJSONEquals}
    ${Session}          | ${SessionGenerator}          | ${toJSONEquals}
    ${ProgramBlueprint} | ${ProgramBlueprintGenerator} | ${toJSONEquals}
    ${Weight}           | ${WeightGenerator}           | ${toJSONEquals}
  `(
    'should convert back and forth between $type.name surviving an encoding',
    ({ initialValueGenerator, type, assertEquals }) => {
      it('with json', () => {
        fc.assert(
          fc.property(initialValueGenerator as fc.Arbitrary<unknown>, (initialValue) => {
            const converted = (initialValue as ToJSON).toJSON();
            const encoded = toJsonString(converted);
            const convertedBack = (type as FromJSON).fromJSON(fromJsonString(encoded));

            assertEquals(initialValue, convertedBack);
          }),
        );
      });
    },
  );

  it('should be able to decode a backup from original liftlog', () => {
    const compressedData = readFileSync(__dirname + '/' + 'export.liftlogbackup.gz');
    const decompressed = gunzipSync(compressedData);
    const decoded = LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2.decode(decompressed);
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

interface FromJSON {
  fromJSON(t: unknown): unknown;
}

function toJSONEquals(a: ToJSON, b: ToJSON) {
  expect(b.toJSON()).toEqual(a.toJSON());
}

function fromSessionHistoryDao(
  sessionHistoryModel: LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2,
): Session[] {
  return sessionHistoryModel.completedSessions.map((item) =>
    Session.fromJSON(sessionMigrations.migrate(ProtobufToJsonV1Migrator.migrateSession(item))),
  );
}
