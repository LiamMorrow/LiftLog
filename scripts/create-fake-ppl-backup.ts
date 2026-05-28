#!/usr/bin/env -S node --experimental-strip-types
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { randomUUID } from 'node:crypto';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

type WeightUnit = 'kilograms' | 'pounds';
type DistanceUnit = 'kilometre' | 'mile' | 'metre' | 'yard';

type WeightedExerciseDefinition = {
  kind: 'weighted';
  name: string;
  sets: number;
  reps: number;
  startWeight: number;
  increment: number;
  failureIncrement?: number;
};

type CardioExerciseDefinition = {
  kind: 'cardio';
  name: string;
  targetMinutes: number;
  trackDistance?: boolean;
  distanceUnit?: DistanceUnit;
  startDistance?: number;
  distanceIncrement?: number;
};

type ExerciseDefinition = WeightedExerciseDefinition | CardioExerciseDefinition;

type SessionDefinition = {
  name: string;
  notes: string;
  exercises: ExerciseDefinition[];
};

type WeightedPerformance = {
  weight: number;
  completedSets: number;
  repsBySet: number[];
  nextWeight: number;
};

type CardioPerformance = {
  minutes: number;
  distance?: number;
};

const PROGRAM_NAME = 'Fake PPL 12 Week Progression';
const DEFAULT_OUTPUT = 'output/fake-ppl-3-months.liftlogbackup.gz';
const WEIGHT_UNIT = 'kilograms' as const;
const START_DATE = new Date('2026-01-12T17:30:00');
const DAYS_PER_WEEK = [0, 1, 2, 3, 4, 5];
const OFFSET_MINUTES = -START_DATE.getTimezoneOffset();
const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const { LiftLog, google } = await loadProtoModule();

const SessionBlueprintDaoV2 =
  LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2;
const ExerciseBlueprintDaoV2 =
  LiftLog.Ui.Models.SessionBlueprintDao.ExerciseBlueprintDaoV2;
const RestDaoV2 = LiftLog.Ui.Models.SessionBlueprintDao.RestDaoV2;
const CardioTarget = LiftLog.Ui.Models.SessionBlueprintDao.CardioTarget;
const CardioExerciseSetBlueprintDao =
  LiftLog.Ui.Models.SessionBlueprintDao.CardioExerciseSetBlueprintDao;
const ProgramBlueprintDaoV1 =
  LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1;
const SessionDaoV2 = LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2;
const RecordedExerciseDaoV2 =
  LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2;
const PotentialSetDaoV2 = LiftLog.Ui.Models.SessionHistoryDao.PotentialSetDaoV2;
const RecordedSetDaoV2 = LiftLog.Ui.Models.SessionHistoryDao.RecordedSetDaoV2;
const RecordedCardioExerciseSetDao =
  LiftLog.Ui.Models.SessionHistoryDao.RecordedCardioExerciseSetDao;
const ExportedDataDaoV2 =
  LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2;
const WeightUnitDao = LiftLog.Ui.Models.WeightUnit;
const ExerciseType = LiftLog.Ui.Models.SessionBlueprintDao.ExerciseType;

const sessions: SessionDefinition[] = [
  {
    name: 'Push',
    notes: 'Chest, shoulders, triceps. Short incline walk cooldown.',
    exercises: [
      {
        kind: 'weighted',
        name: 'Barbell Bench Press',
        sets: 4,
        reps: 6,
        startWeight: 72.5,
        increment: 2.5,
        failureIncrement: 1.25,
      },
      {
        kind: 'weighted',
        name: 'Overhead Press',
        sets: 3,
        reps: 8,
        startWeight: 40,
        increment: 1.25,
      },
      {
        kind: 'weighted',
        name: 'Incline Dumbbell Press',
        sets: 3,
        reps: 10,
        startWeight: 24,
        increment: 1,
      },
      {
        kind: 'weighted',
        name: 'Cable Lateral Raise',
        sets: 3,
        reps: 14,
        startWeight: 7.5,
        increment: 0.5,
      },
      {
        kind: 'weighted',
        name: 'Rope Triceps Pushdown',
        sets: 3,
        reps: 12,
        startWeight: 27.5,
        increment: 1.25,
      },
      {
        kind: 'cardio',
        name: 'Incline Walk',
        targetMinutes: 12,
        trackDistance: true,
        distanceUnit: 'kilometre',
        startDistance: 1.1,
        distanceIncrement: 0.02,
      },
    ],
  },
  {
    name: 'Pull',
    notes: 'Back, biceps, rear delts. Finish with rowing.',
    exercises: [
      {
        kind: 'weighted',
        name: 'Deadlift',
        sets: 3,
        reps: 5,
        startWeight: 110,
        increment: 5,
        failureIncrement: 2.5,
      },
      {
        kind: 'weighted',
        name: 'Weighted Pull-Up',
        sets: 3,
        reps: 6,
        startWeight: 5,
        increment: 1.25,
      },
      {
        kind: 'weighted',
        name: 'Chest Supported Row',
        sets: 3,
        reps: 10,
        startWeight: 42.5,
        increment: 2.5,
      },
      {
        kind: 'weighted',
        name: 'Lat Pulldown',
        sets: 3,
        reps: 12,
        startWeight: 52.5,
        increment: 2.5,
      },
      {
        kind: 'weighted',
        name: 'EZ Bar Curl',
        sets: 3,
        reps: 10,
        startWeight: 25,
        increment: 1.25,
      },
      {
        kind: 'cardio',
        name: 'Row Erg',
        targetMinutes: 10,
        trackDistance: true,
        distanceUnit: 'kilometre',
        startDistance: 2.05,
        distanceIncrement: 0.04,
      },
    ],
  },
  {
    name: 'Legs',
    notes: 'Squat focus, posterior chain, calves, then bike.',
    exercises: [
      {
        kind: 'weighted',
        name: 'Back Squat',
        sets: 4,
        reps: 6,
        startWeight: 92.5,
        increment: 2.5,
      },
      {
        kind: 'weighted',
        name: 'Romanian Deadlift',
        sets: 3,
        reps: 8,
        startWeight: 82.5,
        increment: 2.5,
      },
      {
        kind: 'weighted',
        name: 'Leg Press',
        sets: 3,
        reps: 12,
        startWeight: 180,
        increment: 5,
      },
      {
        kind: 'weighted',
        name: 'Walking Lunge',
        sets: 2,
        reps: 12,
        startWeight: 18,
        increment: 1,
      },
      {
        kind: 'weighted',
        name: 'Standing Calf Raise',
        sets: 4,
        reps: 15,
        startWeight: 60,
        increment: 2.5,
      },
      {
        kind: 'cardio',
        name: 'Bike Cooldown',
        targetMinutes: 15,
        trackDistance: true,
        distanceUnit: 'kilometre',
        startDistance: 5.4,
        distanceIncrement: 0.08,
      },
    ],
  },
];

const args = parseArgs(process.argv.slice(2));
const outputPath = args.output
  ? resolve(process.cwd(), args.output)
  : resolve(scriptDirectory, DEFAULT_OUTPUT);
const activeProgramId = randomUUID();
const performedSessions = createPerformedSessions();
const savedProgram = new ProgramBlueprintDaoV1({
  name: PROGRAM_NAME,
  sessions: sessions.map(toSessionBlueprintDao),
  lastEdited: toDateOnlyDao(new Date('2026-04-06T12:00:00')),
});

const backup = new ExportedDataDaoV2({
  sessions: performedSessions,
  savedPrograms: {
    [activeProgramId]: savedProgram,
  },
  activeProgramId: new google.protobuf.StringValue({ value: activeProgramId }),
});

const encoded = ExportedDataDaoV2.encode(backup).finish();
const compressed = gzipSync(encoded);

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, compressed);

console.log(`Created fake LiftLog backup at ${outputPath}`);
console.log(`Sessions: ${performedSessions.length}`);
console.log(`Program: ${PROGRAM_NAME}`);

function createPerformedSessions() {
  const carriedState = new Map<string, number>();
  const completedSessions: InstanceType<typeof SessionDaoV2>[] = [];

  for (let week = 0; week < 12; week++) {
    for (const dayIndex of DAYS_PER_WEEK) {
      const template = sessions[dayIndex % sessions.length];
      const sessionDate = addDays(START_DATE, week * 7 + dayIndex);
      const fatigueWeek = week === 4 || week === 8;
      const sessionMissBias = (week + dayIndex) % 7 === 0 || fatigueWeek;

      const recordedExercises = template.exercises.map((exercise, exerciseIdx) =>
        exercise.kind === 'weighted'
          ? createWeightedExerciseRecord(
              exercise,
              sessionDate,
              carriedState,
              week,
              dayIndex,
              exerciseIdx,
              sessionMissBias,
            )
          : createCardioExerciseRecord(exercise, sessionDate, week, dayIndex),
      );

      completedSessions.push(
        new SessionDaoV2({
          id: toUuidDao(randomUUID()),
          sessionName: template.name,
          blueprintNotes: template.notes,
          date: toDateOnlyDao(sessionDate),
          bodyweightValue: toDecimalDao(82 + week * 0.12 + dayIndex * 0.03),
          bodyweightUnit: WeightUnitDao.KILOGRAMS,
          recordedExercises,
        }),
      );
    }
  }

  return completedSessions;
}

function createWeightedExerciseRecord(
  exercise: WeightedExerciseDefinition,
  sessionDate: Date,
  state: Map<string, number>,
  week: number,
  dayIndex: number,
  exerciseIndex: number,
  sessionMissBias: boolean,
) {
  const stateKey = `${exercise.name}_${exercise.sets}_${exercise.reps}`;
  const currentWeight = state.get(stateKey) ?? exercise.startWeight;
  const missSeed = week * 17 + dayIndex * 5 + exerciseIndex;
  const missSet = sessionMissBias && missSeed % 4 === 0;
  const partialLastRepLoss = missSeed % 5 === 0;
  const performance = buildWeightedPerformance(
    exercise,
    currentWeight,
    missSet,
    partialLastRepLoss,
  );

  state.set(stateKey, performance.nextWeight);

  return new RecordedExerciseDaoV2({
    exerciseBlueprint: toWeightedBlueprintDao(exercise),
    type: ExerciseType.WEIGHTED,
    notes:
      missSet && exerciseIndex < 2
        ? new google.protobuf.StringValue({
            value: 'A little fatigued today, missed the final set.',
          })
        : null,
    potentialSets: performance.repsBySet.map((repsCompleted, setIndex) => {
      const completed = setIndex < performance.completedSets;
      const setTime = new Date(
        sessionDate.getTime() + (exerciseIndex * 14 + setIndex * 3) * 60_000,
      );

      return new PotentialSetDaoV2({
        weightValue: toDecimalDao(performance.weight),
        weightUnit: toWeightUnitDao(WEIGHT_UNIT),
        recordedSet: completed
          ? new RecordedSetDaoV2({
              repsCompleted,
              completionDate: toDateOnlyDao(setTime),
              completionTime: toTimeOnlyDao(setTime),
              completionOffset: { totalSeconds: OFFSET_MINUTES * 60 },
            })
          : null,
      });
    }),
  });
}

function buildWeightedPerformance(
  exercise: WeightedExerciseDefinition,
  currentWeight: number,
  missSet: boolean,
  partialLastRepLoss: boolean,
): WeightedPerformance {
  const completedSets = missSet ? exercise.sets - 1 : exercise.sets;
  const repsBySet = Array.from({ length: exercise.sets }, (_, index) => {
    if (index >= completedSets) {
      return exercise.reps;
    }
    const isLastCompletedSet = index === completedSets - 1;
    if (missSet && isLastCompletedSet && partialLastRepLoss) {
      return Math.max(exercise.reps - 1, 1);
    }
    return exercise.reps;
  });

  const allSetsCompleted = completedSets === exercise.sets;
  const allRepsHit = allSetsCompleted && repsBySet.every((x) => x >= exercise.reps);
  const nextWeight = roundToQuarter(
    currentWeight +
      (allRepsHit
        ? exercise.increment
        : exercise.failureIncrement ?? exercise.increment / 2),
  );

  return {
    weight: currentWeight,
    completedSets,
    repsBySet,
    nextWeight,
  };
}

function createCardioExerciseRecord(
  exercise: CardioExerciseDefinition,
  sessionDate: Date,
  week: number,
  dayIndex: number,
) {
  const performance = buildCardioPerformance(exercise, week, dayIndex);
  const completionTime = new Date(sessionDate.getTime() + 105 * 60_000);

  return new RecordedExerciseDaoV2({
    exerciseBlueprint: toCardioBlueprintDao(exercise),
    type: ExerciseType.CARDIO,
    cardioSets: [
      new RecordedCardioExerciseSetDao({
        blueprint: toCardioSetBlueprintDao(exercise),
        completionDateTime: toDateTimeDao(completionTime),
        duration: toDurationDaoMinutes(performance.minutes),
        distanceValue:
          performance.distance !== undefined
            ? toDecimalDao(performance.distance)
            : null,
        distanceUnit:
          performance.distance !== undefined
            ? new google.protobuf.StringValue({
                value: exercise.distanceUnit ?? 'kilometre',
              })
            : null,
      }),
    ],
  });
}

function buildCardioPerformance(
  exercise: CardioExerciseDefinition,
  week: number,
  dayIndex: number,
): CardioPerformance {
  const minutes = exercise.targetMinutes + (week >= 6 ? 2 : week >= 10 ? 3 : 0);
  const distance =
    exercise.trackDistance && exercise.startDistance !== undefined
      ? roundToHundredth(
          exercise.startDistance +
            week * (exercise.distanceIncrement ?? 0.03) +
            (dayIndex % 3) * 0.02,
        )
      : undefined;

  return { minutes, distance };
}

function toSessionBlueprintDao(session: SessionDefinition) {
  return new SessionBlueprintDaoV2({
    name: session.name,
    notes: session.notes,
    exerciseBlueprints: session.exercises.map((exercise) =>
      exercise.kind === 'weighted'
        ? toWeightedBlueprintDao(exercise)
        : toCardioBlueprintDao(exercise),
    ),
  });
}

function toWeightedBlueprintDao(exercise: WeightedExerciseDefinition) {
  return new ExerciseBlueprintDaoV2({
    name: exercise.name,
    notes: '',
    link: '',
    type: ExerciseType.WEIGHTED,
    sets: exercise.sets,
    repsPerSet: exercise.reps,
    weightIncreaseOnSuccess: toDecimalDao(exercise.increment),
    restBetweenSets: new RestDaoV2({
      minRest: { seconds: '90', nanos: 0 },
      maxRest: { seconds: '180', nanos: 0 },
      failureRest: { seconds: '300', nanos: 0 },
    }),
    supersetWithNext: false,
  });
}

function toCardioBlueprintDao(exercise: CardioExerciseDefinition) {
  return new ExerciseBlueprintDaoV2({
    name: exercise.name,
    notes: '',
    link: '',
    type: ExerciseType.CARDIO,
    cardioSets: [toCardioSetBlueprintDao(exercise)],
  });
}

function toCardioSetBlueprintDao(exercise: CardioExerciseDefinition) {
  return new CardioExerciseSetBlueprintDao({
    cardioTarget: new CardioTarget({
      type: 'time',
      timeValue: { seconds: String(exercise.targetMinutes * 60), nanos: 0 },
    }),
    trackDuration: true,
    trackDistance: exercise.trackDistance ?? false,
    trackResistance: false,
    trackIncline: false,
    trackWeight: false,
    trackSteps: false,
  });
}

function toUuidDao(uuid: string) {
  const hex = uuid.replaceAll('-', '');
  const parsed = Uint8Array.from(
    Array.from({ length: 16 }, (_, index) =>
      Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16),
    ),
  );

  return {
    value: Uint8Array.from([
      parsed[3],
      parsed[2],
      parsed[1],
      parsed[0],
      parsed[5],
      parsed[4],
      parsed[7],
      parsed[6],
      parsed[8],
      parsed[9],
      parsed[10],
      parsed[11],
      parsed[12],
      parsed[13],
      parsed[14],
      parsed[15],
    ]),
  };
}

function toWeightUnitDao(unit: WeightUnit) {
  return unit === 'kilograms' ? WeightUnitDao.KILOGRAMS : WeightUnitDao.POUNDS;
}

function toDecimalDao(value: number) {
  const units = Math.floor(value);
  const nanos = Math.round((value - units) * 1_000_000_000);

  return {
    units: String(units),
    nanos,
  };
}

function toDateOnlyDao(date: Date) {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
}

function toTimeOnlyDao(date: Date) {
  return {
    hour: date.getHours(),
    minute: date.getMinutes(),
    second: date.getSeconds(),
    millisecond: date.getMilliseconds(),
    microsecond: 0,
  };
}

function toDateTimeDao(date: Date) {
  return {
    date: toDateOnlyDao(date),
    time: toTimeOnlyDao(date),
    offset: {
      totalSeconds: OFFSET_MINUTES * 60,
    },
  };
}

function toDurationDaoMinutes(minutes: number) {
  return {
    seconds: String(minutes * 60),
    nanos: 0,
  };
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function roundToQuarter(value: number) {
  return Math.round(value * 4) / 4;
}

function roundToHundredth(value: number) {
  return Math.round(value * 100) / 100;
}

function parseArgs(argv: string[]) {
  const result: { output?: string } = {};

  for (let index = 0; index < argv.length; index++) {
    const current = argv[index];
    if (current === '--output' || current === '-o') {
      result.output = argv[index + 1];
      index++;
    }
  }

  return result;
}

async function loadProtoModule() {
  const generatedProtoPath = resolve(scriptDirectory, '../app/gen/proto.js');
  const protobufRuntimePath = pathToFileURL(
    resolve(scriptDirectory, '../app/node_modules/protobufjs/minimal.js'),
  ).href;
  const generatedSource = readFileSync(generatedProtoPath, 'utf8');
  const patchedSource = generatedSource.replace(
    'import * as $protobuf from "protobufjs/minimal";',
    `import protobufMinimal from ${JSON.stringify(protobufRuntimePath)};\nconst $protobuf = protobufMinimal.default ?? protobufMinimal;`,
  );

  const tempDirectory = mkdtempSync(join(tmpdir(), 'liftlog-proto-'));
  const tempModulePath = join(tempDirectory, 'proto.mjs');
  writeFileSync(tempModulePath, patchedSource);
  process.on('exit', () => rmSync(tempDirectory, { recursive: true, force: true }));

  return import(pathToFileURL(tempModulePath).href) as Promise<{
    LiftLog: typeof import('../app/gen/proto.js').LiftLog;
    google: typeof import('../app/gen/proto.js').google;
  }>;
}
