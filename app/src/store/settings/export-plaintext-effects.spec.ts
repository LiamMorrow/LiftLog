import { describe, it, expect, vi, MockedObject } from 'vitest';
import { LocalDate, OffsetDateTime, ZoneOffset } from '@js-joda/core';
import BigNumber from 'bignumber.js';
import { v4 as uuid } from 'uuid';
import {
  SessionBlueprint,
  WeightedExerciseBlueprint,
  CardioExerciseBlueprint,
  Rest,
  CardioExerciseSetBlueprint,
  IncreaseAllEvenlyProgressiveOverload,
} from '@/models/blueprint-models';
import { Weight } from '@/models/weight';
import { Session } from '@/models/session-models/session';
import {
  PotentialSet,
  RecordedSet,
  RecordedWeightedExercise,
} from '@/models/session-models/recorded-weighted-exercise';
import { RecordedCardioExercise } from '@/models/session-models/recorded-cardio-exercise';
import { exportPlainText } from '@/store/settings';
import Enumerable from 'linq';
import { createAddEffectTestBed } from '@/utils/__test__/add-effect-testbed';
import { addExportPlaintextEffects } from '@/store/settings/export-plaintext-effects';
import { FileExportService } from '@/services/file-export-service';
import { fromJsonBytes } from '@/services/encryption-service';
import { SessionJSON } from '@/models/storage/versions/latest';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const t = OffsetDateTime.of(2024, 1, 15, 10, 0, 0, 0, ZoneOffset.UTC);

function makeWeightedBlueprint(
  name = 'Bench Press',
  sets = 3,
  repsPerSet = 10,
) {
  return new WeightedExerciseBlueprint(
    name,
    sets,
    repsPerSet,
    new IncreaseAllEvenlyProgressiveOverload(BigNumber('2.5')),
    Rest.medium,
    false,
    '',
    '',
  );
}

function makeWeightedExercise(
  name = 'Bench Press',
  sets = 3,
  weightKg = 100,
  reps = 10,
): RecordedWeightedExercise {
  const bp = makeWeightedBlueprint(name, sets, reps);
  const weight = new Weight(weightKg, 'kilograms');
  return new RecordedWeightedExercise(
    bp,
    Array.from(
      { length: sets },
      (_, i) =>
        new PotentialSet(new RecordedSet(reps, t.plusSeconds(i * 60)), weight),
    ),
    undefined,
  );
}

function makeCardioExercise(name = 'Treadmill') {
  const bp = new CardioExerciseBlueprint(
    name,
    [CardioExerciseSetBlueprint.empty()],
    '',
    '',
  );
  return RecordedCardioExercise.empty(bp);
}

function makeSession(
  exercises:
    | RecordedWeightedExercise[]
    | ReturnType<typeof makeCardioExercise>[],
): Session {
  const blueprintExercises = exercises.map((e) => e.blueprint);
  return new Session(
    uuid(),
    new SessionBlueprint('Push Day', blueprintExercises, ''),
    exercises,
    LocalDate.of(2024, 1, 15),
    undefined,
    undefined,
  );
}

function makeProgressRepository(sessions: Session[]) {
  return {
    getOrderedSessions: vi.fn(() => Enumerable.from(sessions)),
  };
}

function makeFileExportService(): MockedObject<FileExportService> {
  return {
    exportBytes: vi.fn().mockResolvedValue(undefined),
  };
}

describe('export-plaintext-effects', () => {
  // ─── CSV export ───────────────────────────────────────────────────────────────
  describe('addExportPlaintextEffects — CSV', () => {
    it('calls exportBytes with a .csv filename and text/csv content type', async () => {
      const fileExportService = makeFileExportService();
      const testBed = createAddEffectTestBed({
        services: {
          progressRepository: makeProgressRepository([
            makeSession([makeWeightedExercise()]),
          ]),
          fileExportService,
        },
      });
      addExportPlaintextEffects(testBed.addEffect);

      await testBed.dispatchHandled(exportPlainText({ format: 'CSV' }));

      expect(fileExportService.exportBytes).toHaveBeenCalledOnce();
      const [fileName, , contentType] =
        fileExportService.exportBytes.mock.calls[0]!;
      expect(fileName).toMatch(/^liftlog-export\.\d{8}_\d{6}\.csv$/);
      expect(contentType).toBe('text/csv');
    });

    it('CSV output includes header row and one row per completed set', async () => {
      const fileExportService = makeFileExportService();
      // 2 exercises × 3 sets each = 6 data rows
      const session = makeSession([
        makeWeightedExercise('Bench Press', 3, 100, 10),
        makeWeightedExercise('Squat', 3, 140, 8),
      ]).with({ id: '124' });
      const testBed = createAddEffectTestBed({
        services: {
          progressRepository: makeProgressRepository([session]),
          fileExportService,
        },
      });
      addExportPlaintextEffects(testBed.addEffect);

      await testBed.dispatchHandled(exportPlainText({ format: 'CSV' }));

      const [, bytes] = fileExportService.exportBytes.mock.calls[0]!;
      const csv = new TextDecoder().decode(bytes);
      const lines = csv.trim().split('\n');
      // 1 header + 6 data rows
      expect(lines).toHaveLength(7);
      expect(lines).toMatchSnapshot();
    });

    it('CSV rows contain the correct exercise name, weight, and reps', async () => {
      const fileExportService = makeFileExportService();
      const session = makeSession([
        makeWeightedExercise('Deadlift', 1, 180, 5),
      ]);
      const testBed = createAddEffectTestBed({
        services: {
          progressRepository: makeProgressRepository([session]),
          fileExportService,
        },
      });
      addExportPlaintextEffects(testBed.addEffect);

      await testBed.dispatchHandled(exportPlainText({ format: 'CSV' }));

      const [, bytes] = fileExportService.exportBytes.mock.calls[0]!;
      const csv = new TextDecoder().decode(bytes);
      expect(csv).toContain('Deadlift');
      expect(csv).toContain('180');
      expect(csv).toContain('5');
      expect(csv).toContain('kg');
    });

    it('skips cardio exercises entirely', async () => {
      const fileExportService = makeFileExportService();
      const session = makeSession([makeCardioExercise('Treadmill')]);
      const testBed = createAddEffectTestBed({
        services: {
          progressRepository: makeProgressRepository([session]),
          fileExportService,
        },
      });
      addExportPlaintextEffects(testBed.addEffect);

      await testBed.dispatchHandled(exportPlainText({ format: 'CSV' }));

      const [, bytes] = fileExportService.exportBytes.mock.calls[0]!;
      const csv = new TextDecoder().decode(bytes);
      const lines = csv.trim().split('\n').filter(Boolean);
      // no data rows for cardio, and no header
      expect(lines).toHaveLength(0);
    });

    it('skips uncompleted sets (set === undefined)', async () => {
      const fileExportService = makeFileExportService();
      const bp = makeWeightedBlueprint('OHP', 3, 8);
      const exercise = new RecordedWeightedExercise(
        bp,
        [
          new PotentialSet(new RecordedSet(8, t), new Weight(60, 'kilograms')),
          new PotentialSet(undefined, new Weight(60, 'kilograms')), // incomplete
          new PotentialSet(undefined, new Weight(60, 'kilograms')), // incomplete
        ],
        undefined,
      );
      const session = makeSession([exercise]);
      const testBed = createAddEffectTestBed({
        services: {
          progressRepository: makeProgressRepository([session]),
          fileExportService,
        },
      });
      addExportPlaintextEffects(testBed.addEffect);

      await testBed.dispatchHandled(exportPlainText({ format: 'CSV' }));

      const [, bytes] = fileExportService.exportBytes.mock.calls[0]!;
      const csv = new TextDecoder().decode(bytes);
      const lines = csv.trim().split('\n').filter(Boolean);
      // header + 1 completed set
      expect(lines).toHaveLength(2);
    });

    it('includes exercise notes in the CSV', async () => {
      const fileExportService = makeFileExportService();
      const bp = makeWeightedBlueprint('Curl', 1, 12);
      const exercise = new RecordedWeightedExercise(
        bp,
        [new PotentialSet(new RecordedSet(12, t), new Weight(20, 'kilograms'))],
        'slow eccentric',
      );
      const testBed = createAddEffectTestBed({
        services: {
          progressRepository: makeProgressRepository([makeSession([exercise])]),
          fileExportService,
        },
      });
      addExportPlaintextEffects(testBed.addEffect);

      await testBed.dispatchHandled(exportPlainText({ format: 'CSV' }));

      const [, bytes] = fileExportService.exportBytes.mock.calls[0]!;
      const csv = new TextDecoder().decode(bytes);
      expect(csv).toContain('slow eccentric');
    });

    it('exports rows across multiple sessions', async () => {
      const fileExportService = makeFileExportService();
      const sessions = [
        makeSession([makeWeightedExercise('Bench Press', 2, 100, 10)]),
        makeSession([makeWeightedExercise('Squat', 2, 120, 8)]),
      ];
      const testBed = createAddEffectTestBed({
        services: {
          progressRepository: makeProgressRepository(sessions),
          fileExportService,
        },
      });
      addExportPlaintextEffects(testBed.addEffect);

      await testBed.dispatchHandled(exportPlainText({ format: 'CSV' }));

      const [, bytes] = fileExportService.exportBytes.mock.calls[0]!;
      const csv = new TextDecoder().decode(bytes);
      const lines = csv.trim().split('\n').filter(Boolean);
      // header + 4 data rows (2 sets × 2 sessions)
      expect(lines).toHaveLength(5);
    });
  });

  // ─── JSON export ──────────────────────────────────────────────────────────────

  describe('addExportPlaintextEffects — JSON', () => {
    it('calls exportBytes with a .json filename and application/json content type', async () => {
      const fileExportService = makeFileExportService();
      const testBed = createAddEffectTestBed({
        services: {
          progressRepository: makeProgressRepository([
            makeSession([makeWeightedExercise()]),
          ]),
          fileExportService,
        },
      });
      addExportPlaintextEffects(testBed.addEffect);

      await testBed.dispatchHandled(exportPlainText({ format: 'JSON' }));

      expect(fileExportService.exportBytes).toHaveBeenCalledOnce();
      const [fileName, , contentType] =
        fileExportService.exportBytes.mock.calls[0]!;
      expect(fileName).toMatch(/^liftlog-export\.\d{8}_\d{6}\.json$/);
      expect(contentType).toBe('application/json');
    });

    it('JSON output is valid and parseable', async () => {
      const fileExportService = makeFileExportService();
      const testBed = createAddEffectTestBed({
        services: {
          progressRepository: makeProgressRepository([
            makeSession([makeWeightedExercise()]),
          ]),
          fileExportService,
        },
      });
      addExportPlaintextEffects(testBed.addEffect);

      await testBed.dispatchHandled(exportPlainText({ format: 'JSON' }));

      const [, bytes] = fileExportService.exportBytes.mock.calls[0]!;
      const text = new TextDecoder().decode(bytes);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      expect(() => JSON.parse(text)).not.toThrow();
    });

    it('JSON output contains one entry per session', async () => {
      const fileExportService = makeFileExportService();
      const sessions = [
        makeSession([makeWeightedExercise('Bench Press')]).with({ id: '123' }),
        makeSession([makeWeightedExercise('Squat')]).with({ id: '1234' }),
      ];
      const testBed = createAddEffectTestBed({
        services: {
          progressRepository: makeProgressRepository(sessions),
          fileExportService,
        },
      });
      addExportPlaintextEffects(testBed.addEffect);

      await testBed.dispatchHandled(exportPlainText({ format: 'JSON' }));

      const [, bytes] = fileExportService.exportBytes.mock.calls[0]!;
      const parsed = fromJsonBytes<SessionJSON[]>(bytes);
      expect(parsed).toHaveLength(2);
      expect(parsed).toMatchSnapshot();
    });

    it('JSON output strips blueprint exercises to avoid duplication', async () => {
      const fileExportService = makeFileExportService();
      const testBed = createAddEffectTestBed({
        services: {
          progressRepository: makeProgressRepository([
            makeSession([makeWeightedExercise()]),
          ]),
          fileExportService,
        },
      });
      addExportPlaintextEffects(testBed.addEffect);

      await testBed.dispatchHandled(exportPlainText({ format: 'JSON' }));

      const [, bytes] = fileExportService.exportBytes.mock.calls[0]!;
      const [session] = fromJsonBytes<SessionJSON[]>(bytes);
      expect(
        (session!.blueprint as unknown as { exercises: [] }).exercises,
      ).toBeUndefined();
    });

    it('JSON output includes session id and recorded exercises', async () => {
      const fileExportService = makeFileExportService();
      const session = makeSession([
        makeWeightedExercise('Deadlift', 2, 180, 5),
      ]);
      const testBed = createAddEffectTestBed({
        services: {
          progressRepository: makeProgressRepository([session]),
          fileExportService,
        },
      });
      addExportPlaintextEffects(testBed.addEffect);

      await testBed.dispatchHandled(exportPlainText({ format: 'JSON' }));

      const [, bytes] = fileExportService.exportBytes.mock.calls[0]!;
      const [exported] = fromJsonBytes<SessionJSON[]>(bytes);
      expect(exported!.id).toBe(session.id);
      expect(exported!.recordedExercises).toHaveLength(1);
    });
  });

  // ─── Shared behaviour ─────────────────────────────────────────────────────────

  describe('addExportPlaintextEffects — shared', () => {
    it('does not dispatch any actions', async () => {
      const fileExportService = makeFileExportService();
      const testBed = createAddEffectTestBed({
        services: {
          progressRepository: makeProgressRepository([
            makeSession([makeWeightedExercise()]),
          ]),
          fileExportService,
        },
      });
      addExportPlaintextEffects(testBed.addEffect);

      await testBed.dispatchHandled(exportPlainText({ format: 'CSV' }));

      expect(testBed.dispatchedActions).toHaveLength(0);
    });

    it('handles an empty session list without throwing', async () => {
      const fileExportService = makeFileExportService();
      const testBed = createAddEffectTestBed({
        services: {
          progressRepository: makeProgressRepository([]),
          fileExportService,
        },
      });
      addExportPlaintextEffects(testBed.addEffect);

      await expect(
        testBed.dispatchHandled(exportPlainText({ format: 'CSV' })),
      ).resolves.not.toThrow();
      await expect(
        testBed.dispatchHandled(exportPlainText({ format: 'JSON' })),
      ).resolves.not.toThrow();
    });
  });
});
