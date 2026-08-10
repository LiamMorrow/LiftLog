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

            // oxlint-disable-next-line typescript/no-unsafe-call
            assertEquals(initialValue, convertedBack);
          }),
        );
      });
    },
  );

  /*
   * A real export from the original C# app, run through the whole session chain. It is the only
   * end-to-end evidence in the suite that a migration works on data that was not written by a
   * fixture, so it is worth asserting more of than a session count.
   *
   * What it cannot prove, and what per-step fixtures therefore have to cover: it holds no `range` or
   * `perSet` rep configs, no bodyweight exercises, no supersets, no cardio, no `kilograms` or
   * `pounds` weights, and no exercise whose recorded set count disagrees with its blueprint.
   */
  describe('a backup from the original liftlog', () => {
    const sessions = fromSessionHistoryDao(
      LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2.decode(
        gunzipSync(readFileSync(__dirname + '/' + 'export.liftlogbackup.gz')),
      ),
    );
    const weighted = sessions.flatMap((s) => s.recordedExercises.filter((e) => e.type === 'RecordedWeightedExercise'));
    const sets = weighted.flatMap((e) => e.potentialSets);

    it('decodes every session', () => {
      expect(sessions.length).toBe(85);
      expect(sessions.filter((s) => s.bodyweight).length).toBe(36);
      expect(weighted.length).toBe(523);
    });

    it('totals the same weight and bodyweight', () => {
      const totalWeightLifted = sessions.map((x) => x.totalWeightLifted).reduce((a, b) => a.plus(b));
      const bodyweightSum = sessions
        .values()
        .map((x) => x.bodyweight)
        .reduce((a, b) => (a && b ? a.plus(b) : a ? a : b));

      expect(totalWeightLifted).toEqual(new Weight(705959.136, 'nil'));
      expect(bodyweightSum).toEqual(new Weight(3065.3, 'nil'));
    });

    it('resolves the same progression lineages', () => {
      expect(new Set(weighted.map((e) => e.progressionKey())).size).toBe(50);
      expect(new Set(weighted.map((e) => e.movementKey())).size).toBe(34);
    });

    it('keeps recorded and unrecorded sets distinct', () => {
      expect(sets.length).toBe(1654);
      expect(sets.filter((s) => s.set).length).toBe(1614);
      expect(sets.filter((s) => !s.set).length).toBe(40);
      expect(sets.filter((s) => s.set?.repsCompleted === 0).length).toBe(2);
      expect(sets.reduce((total, s) => total + (s.set?.repsCompleted ?? 0), 0)).toBe(15062);
    });

    /** Assisted work is stored as a negative load, so a migration that clamps or drops a sign loses it. */
    it('preserves zero and negative loads', () => {
      expect(sets.filter((s) => s.weight.value.isZero()).length).toBe(201);
      expect(sets.filter((s) => s.weight.value.isNegative()).length).toBe(75);
      expect(new Set(sets.map((s) => s.weight.unit))).toEqual(new Set(['nil']));
    });
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
