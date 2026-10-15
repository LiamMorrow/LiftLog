import {
  cardioSetsSchema,
  effectiveWeightedSetsView,
  recordedExercisesSchema,
  sessionsSchema,
  weightedSetsSchema,
} from '@/db/schema';
import { MovementKey, ProgressionKey } from '@/models/blueprint-models';
import { TemporalComparer } from '@/models/comparers';
import { freeformSessionName, fromRecordedExerciseJSON, RecordedExercise, Session } from '@/models/session-models';
import { Weight } from '@/models/weight';
import {
  CardioExerciseSetBlueprintJSON,
  CardioTargetJSON,
  DurationJSON,
  fromDurationJSON,
  fromOffsetDateTimeJSON,
  OffsetDateTimeJSON,
  RecordedCardioExerciseJSON,
  RecordedCardioExerciseSetJSON,
  RecordedExerciseJSON,
  RecordedWeightedExerciseJSON,
  RestJSON,
  SessionJSON,
  toDurationJSON,
  WeightJSON,
} from '@/models/storage/versions/latest';
import { fromLocalDateJSON, toLocalDateJSON } from '@/models/storage/versions/libs';
import { Duration, LocalDate, OffsetDateTime } from '@js-joda/core';
import {
  and,
  desc,
  eq,
  getTableColumns,
  gt,
  gte,
  inArray,
  isNotNull,
  lt,
  lte,
  max,
  min,
  ne,
  or,
  SQL,
  sql,
} from 'drizzle-orm';
import Enumerable from 'linq';
import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { SQLiteColumn } from 'drizzle-orm/sqlite-core';

type SessionRow = typeof sessionsSchema.$inferSelect;
type RecordedExerciseRow = typeof recordedExercisesSchema.$inferSelect;
type WeightedSetRow = typeof weightedSetsSchema.$inferSelect;
type CardioSetRow = typeof cardioSetsSchema.$inferSelect;

const summaryColumns = ['volumeKg', 'lastCompletedAtMs'] as const;
type SummaryColumn = (typeof summaryColumns)[number];

export interface SessionRows {
  session: Omit<SessionRow, 'active' | 'bodyweightKg' | SummaryColumn>;
  exercises: Omit<RecordedExerciseRow, 'bestOneRepMaxKg'>[];
  weightedSets: Omit<WeightedSetRow, 'weightKg'>[];
  cardioSets: CardioSetRow[];
}

const toMs = (duration: DurationJSON) => fromDurationJSON(duration).toMillis();
const fromMs = (ms: number) => toDurationJSON(Duration.ofMillis(ms));
const toEpochMs = (time: OffsetDateTimeJSON) => fromOffsetDateTimeJSON(time).toInstant().toEpochMilli();

function required<T>(value: T | null, column: string): T {
  if (value === null) {
    throw new Error(`Stored session is missing ${column}`);
  }
  return value;
}

const restToColumns = (rest: RestJSON | undefined) => ({
  restMinMs: rest ? toMs(rest.minRest) : null,
  restMaxMs: rest ? toMs(rest.maxRest) : null,
  restFailureMs: rest ? toMs(rest.failureRest) : null,
});

function restFromColumns(
  row: Pick<RecordedExerciseRow, 'restMinMs' | 'restMaxMs' | 'restFailureMs'>,
): RestJSON | undefined {
  if (row.restMinMs === null || row.restMaxMs === null || row.restFailureMs === null) {
    return undefined;
  }
  return { minRest: fromMs(row.restMinMs), maxRest: fromMs(row.restMaxMs), failureRest: fromMs(row.restFailureMs) };
}

function cardioSetToColumns(set: RecordedCardioExerciseSetJSON) {
  const { target } = set.blueprint;
  return {
    targetType: target.type,
    targetDurationMs: target.type === 'time' ? toMs(target.value) : null,
    targetDistanceValue: target.type === 'distance' ? target.value.value : null,
    targetDistanceUnit: target.type === 'distance' ? target.value.unit : null,
    trackDuration: set.blueprint.trackDuration,
    trackDistance: set.blueprint.trackDistance,
    trackResistance: set.blueprint.trackResistance,
    trackIncline: set.blueprint.trackIncline,
    trackWeight: set.blueprint.trackWeight,
    trackSteps: set.blueprint.trackSteps,
    ...restToColumns(set.blueprint.restBetweenSets),
    completedAt: set.completionDateTime ?? null,
    completedAtMs: set.completionDateTime ? toEpochMs(set.completionDateTime) : null,
    durationMs: set.duration ? toMs(set.duration) : null,
    distanceValue: set.distance?.value ?? null,
    distanceUnit: set.distance?.unit ?? null,
    resistance: set.resistance ?? null,
    incline: set.incline ?? null,
    weightValue: set.weight?.value ?? null,
    weightUnit: set.weight?.unit ?? null,
    steps: set.steps ?? null,
  };
}

export function sessionToRows(session: Session): SessionRows {
  const json = session.toJSON();
  const rows: SessionRows = {
    session: {
      id: json.id,
      name: json.blueprint.name,
      notes: json.blueprint.notes,
      date: json.date,
      bodyweightValue: json.bodyweight?.value ?? null,
      bodyweightUnit: json.bodyweight?.unit ?? null,
    },
    exercises: [],
    weightedSets: [],
    cardioSets: [],
  };

  json.recordedExercises.forEach((exercise, exerciseOrd) => {
    const domain = session.recordedExercises[exerciseOrd]!;
    const shared = {
      sessionId: json.id,
      ord: exerciseOrd,
      type: exercise.type,
      notes: exercise.notes ?? null,
      movementKey: domain.movementKey(),
      progressionKey: domain.progressionKey(),
      name: exercise.blueprint.name,
      blueprintNotes: exercise.blueprint.notes,
      link: exercise.blueprint.link,
    };
    const setKey = (ord: number) => ({ sessionId: json.id, exerciseOrd, ord });

    if (exercise.type === 'RecordedWeightedExercise') {
      const { blueprint } = exercise;
      rows.exercises.push({
        ...shared,
        ...restToColumns(blueprint.restBetweenSets),
        supersetWithNext: blueprint.supersetWithNext,
        resistance: blueprint.resistance,
        plannedSets: blueprint.plannedSets,
        progression: blueprint.progression,
      });
      exercise.potentialSets.forEach((set, ord) =>
        rows.weightedSets.push({
          ...setKey(ord),
          targetMin: set.target.reps.min,
          targetMax: set.target.reps.max,
          weightValue: set.weight.value,
          weightUnit: set.weight.unit,
          repsCompleted: set.set?.repsCompleted ?? null,
          completedAt: set.set?.completionDateTime ?? null,
          completedAtMs: set.set ? toEpochMs(set.set.completionDateTime) : null,
        }),
      );
      return;
    }

    rows.exercises.push({
      ...shared,
      ...restToColumns(undefined),
      supersetWithNext: null,
      resistance: null,
      plannedSets: null,
      progression: null,
    });
    exercise.sets.forEach((set, ord) => rows.cardioSets.push({ ...setKey(ord), ...cardioSetToColumns(set) }));
  });

  return rows;
}

function weightedExerciseFromRows(exercise: RecordedExerciseRow, sets: WeightedSetRow[]): RecordedWeightedExerciseJSON {
  return {
    type: 'RecordedWeightedExercise',
    notes: exercise.notes ?? undefined,
    blueprint: {
      type: 'WeightedExerciseBlueprint',
      name: exercise.name,
      notes: exercise.blueprintNotes,
      link: exercise.link,
      restBetweenSets: required(restFromColumns(exercise) ?? null, 'restMinMs'),
      supersetWithNext: required(exercise.supersetWithNext, 'supersetWithNext'),
      resistance: required(exercise.resistance, 'resistance'),
      plannedSets: required(exercise.plannedSets, 'plannedSets'),
      progression: required(exercise.progression, 'progression'),
    },
    potentialSets: sets.map((set) => ({
      target: { reps: { min: set.targetMin, max: set.targetMax } },
      weight: { value: set.weightValue, unit: set.weightUnit },
      set:
        set.repsCompleted === null
          ? undefined
          : { repsCompleted: set.repsCompleted, completionDateTime: required(set.completedAt, 'completedAt') },
    })),
  };
}

function cardioTargetFromColumns(set: CardioSetRow): CardioTargetJSON {
  return set.targetType === 'time'
    ? { type: 'time', value: fromMs(required(set.targetDurationMs, 'targetDurationMs')) }
    : {
        type: 'distance',
        value: {
          value: required(set.targetDistanceValue, 'targetDistanceValue'),
          unit: required(set.targetDistanceUnit, 'targetDistanceUnit'),
        },
      };
}

function cardioSetBlueprintFromColumns(set: CardioSetRow): CardioExerciseSetBlueprintJSON {
  return {
    target: cardioTargetFromColumns(set),
    trackDuration: set.trackDuration,
    trackDistance: set.trackDistance,
    trackResistance: set.trackResistance,
    trackIncline: set.trackIncline,
    trackWeight: set.trackWeight,
    trackSteps: set.trackSteps,
    restBetweenSets: restFromColumns(set),
  };
}

function cardioExerciseFromRows(exercise: RecordedExerciseRow, sets: CardioSetRow[]): RecordedCardioExerciseJSON {
  const blueprints = sets.map(cardioSetBlueprintFromColumns);
  return {
    type: 'RecordedCardioExercise',
    notes: exercise.notes ?? undefined,
    blueprint: {
      type: 'CardioExerciseBlueprint',
      name: exercise.name,
      notes: exercise.blueprintNotes,
      link: exercise.link,
      sets: blueprints,
    },
    sets: sets.map((set, index) => ({
      blueprint: blueprints[index]!,
      completionDateTime: set.completedAt ?? undefined,
      duration: set.durationMs === null ? undefined : fromMs(set.durationMs),
      distance:
        set.distanceValue === null
          ? undefined
          : { value: set.distanceValue, unit: required(set.distanceUnit, 'distanceUnit') },
      resistance: set.resistance ?? undefined,
      incline: set.incline ?? undefined,
      weight:
        set.weightValue === null ? undefined : { value: set.weightValue, unit: required(set.weightUnit, 'weightUnit') },
      steps: set.steps ?? undefined,
    })),
  };
}

function groupBy<T>(rows: T[], key: (row: T) => string): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const row of rows) {
    const group = groups.get(key(row));
    if (group) {
      group.push(row);
    } else {
      groups.set(key(row), [row]);
    }
  }
  return groups;
}

const setKey = (x: { sessionId: string; exerciseOrd: number }) => `${x.sessionId}/${x.exerciseOrd}`;

function bodyweightFromColumns(row: Pick<SessionRow, 'bodyweightValue' | 'bodyweightUnit'>): WeightJSON | undefined {
  return row.bodyweightValue === null
    ? undefined
    : { value: row.bodyweightValue, unit: required(row.bodyweightUnit, 'bodyweightUnit') };
}

interface SetsByExercise {
  weighted: Map<string, WeightedSetRow[]>;
  cardio: Map<string, CardioSetRow[]>;
}

function groupSetsByExercise(weightedSets: WeightedSetRow[], cardioSets: CardioSetRow[]): SetsByExercise {
  return { weighted: groupBy(weightedSets, setKey), cardio: groupBy(cardioSets, setKey) };
}

function exerciseFromRows(exercise: RecordedExerciseRow, sets: SetsByExercise): RecordedExerciseJSON {
  const key = setKey({ sessionId: exercise.sessionId, exerciseOrd: exercise.ord });
  return exercise.type === 'RecordedWeightedExercise'
    ? weightedExerciseFromRows(exercise, sets.weighted.get(key) ?? [])
    : cardioExerciseFromRows(exercise, sets.cardio.get(key) ?? []);
}

function sessionsFromRows(rows: {
  sessions: Omit<SessionRow, 'active'>[];
  exercises: RecordedExerciseRow[];
  weightedSets: WeightedSetRow[];
  cardioSets: CardioSetRow[];
}): Session[] {
  const exercisesBySession = groupBy(rows.exercises, (x) => x.sessionId);
  const sets = groupSetsByExercise(rows.weightedSets, rows.cardioSets);

  return rows.sessions.map((session) => {
    const recordedExercises = (exercisesBySession.get(session.id) ?? []).map((exercise) =>
      exerciseFromRows(exercise, sets),
    );
    const json: SessionJSON = {
      version: 7,
      id: session.id,
      blueprint: { name: session.name, notes: session.notes },
      date: session.date,
      bodyweight: bodyweightFromColumns(session),
      recordedExercises,
    };
    return Session.fromJSON(json);
  });
}

type SetsTable = typeof weightedSetsSchema | typeof cardioSetsSchema;

const isFinished = eq(sessionsSchema.active, false);

const ofExercise = (sets: SetsTable) =>
  and(eq(recordedExercisesSchema.sessionId, sets.sessionId), eq(recordedExercisesSchema.ord, sets.exerciseOrd));

/** `where` may filter on the session and recorded exercise tables. */
function readExercisesWhere(db: ExpoSQLiteDatabase, where: SQL | undefined) {
  return {
    exercises: db
      .select(getTableColumns(recordedExercisesSchema))
      .from(recordedExercisesSchema)
      .innerJoin(sessionsSchema, eq(sessionsSchema.id, recordedExercisesSchema.sessionId))
      .where(where)
      .orderBy(recordedExercisesSchema.sessionId, recordedExercisesSchema.ord)
      .all(),
    weightedSets: db
      .select(getTableColumns(weightedSetsSchema))
      .from(weightedSetsSchema)
      .innerJoin(recordedExercisesSchema, ofExercise(weightedSetsSchema))
      .innerJoin(sessionsSchema, eq(sessionsSchema.id, weightedSetsSchema.sessionId))
      .where(where)
      .orderBy(weightedSetsSchema.sessionId, weightedSetsSchema.exerciseOrd, weightedSetsSchema.ord)
      .all(),
    cardioSets: db
      .select(getTableColumns(cardioSetsSchema))
      .from(cardioSetsSchema)
      .innerJoin(recordedExercisesSchema, ofExercise(cardioSetsSchema))
      .innerJoin(sessionsSchema, eq(sessionsSchema.id, cardioSetsSchema.sessionId))
      .where(where)
      .orderBy(cardioSetsSchema.sessionId, cardioSetsSchema.exerciseOrd, cardioSetsSchema.ord)
      .all(),
  };
}

/** `where` may only filter on the session table. */
function readSessionsWhere(db: ExpoSQLiteDatabase, where: SQL | undefined): Session[] {
  const sessions = db.select().from(sessionsSchema).where(where).all();
  if (!sessions.length) {
    return [];
  }
  return sessionsFromRows({ sessions, ...readExercisesWhere(db, where) });
}

export function readSessions(db: ExpoSQLiteDatabase): { sessions: Session[]; activeSessionId: string | undefined } {
  return {
    sessions: readSessionsWhere(db, undefined),
    activeSessionId: db
      .select({ id: sessionsSchema.id })
      .from(sessionsSchema)
      .where(eq(sessionsSchema.active, true))
      .get()?.id,
  };
}

export function readSession(db: ExpoSQLiteDatabase, id: string): Session | undefined {
  return readSessionsWhere(db, eq(sessionsSchema.id, id)).at(0);
}

export function readActiveSession(db: ExpoSQLiteDatabase): Session | undefined {
  return readSessionsWhere(db, eq(sessionsSchema.active, true)).at(0);
}

/** Finished sessions dated from `from` to `to`, both inclusive, in no particular order. */
export function readSessionsBetween(db: ExpoSQLiteDatabase, from: LocalDate, to: LocalDate): Session[] {
  return readSessionsWhere(
    db,
    and(isFinished, gte(sessionsSchema.date, toLocalDateJSON(from)), lte(sessionsSchema.date, toLocalDateJSON(to))),
  );
}

export function readEarliestSessionDate(db: ExpoSQLiteDatabase): LocalDate | undefined {
  const earliest = db
    .select({ date: min(sessionsSchema.date) })
    .from(sessionsSchema)
    .where(isFinished)
    .get()?.date;
  return earliest ? fromLocalDateJSON(earliest) : undefined;
}

export function readExistingSessionIds(db: ExpoSQLiteDatabase, ids: string[]): Set<string> {
  if (!ids.length) {
    return new Set();
  }
  return new Set(
    db
      .select({ id: sessionsSchema.id })
      .from(sessionsSchema)
      .where(inArray(sessionsSchema.id, ids))
      .all()
      .map((x) => x.id),
  );
}

/** Every started performance of a movement in a finished session, newest first. */
export function readExerciseHistory(db: ExpoSQLiteDatabase, movementKey: MovementKey): RecordedExercise[] {
  const rows = readExercisesWhere(db, and(isFinished, eq(recordedExercisesSchema.movementKey, movementKey)));
  const sets = groupSetsByExercise(rows.weightedSets, rows.cardioSets);
  return Enumerable.from(rows.exercises)
    .select((exercise) => fromRecordedExerciseJSON(exerciseFromRows(exercise, sets)))
    .where((exercise) => exercise.isStarted)
    .orderByDescending((exercise) => exercise.latestTime, TemporalComparer)
    .toArray();
}

/** Each started exercise picked out by `where`, which may filter on the session and recorded exercise tables. */
function lastCompletionPerExercise(db: ExpoSQLiteDatabase, where: SQL | undefined) {
  const lastCompletion = (sets: SetsTable) =>
    db
      .select({
        sessionId: recordedExercisesSchema.sessionId,
        ord: recordedExercisesSchema.ord,
        progressionKey: recordedExercisesSchema.progressionKey,
        completedAtMs: max(sets.completedAtMs).as('completedAtMs'),
      })
      .from(recordedExercisesSchema)
      .innerJoin(sets, ofExercise(sets))
      .innerJoin(sessionsSchema, eq(sessionsSchema.id, recordedExercisesSchema.sessionId))
      .where(and(where, isNotNull(sets.completedAtMs)))
      .groupBy(recordedExercisesSchema.sessionId, recordedExercisesSchema.ord);
  return lastCompletion(weightedSetsSchema).unionAll(lastCompletion(cardioSetsSchema)).as('performed');
}

type ExerciseKey = { sessionId: string; ord: number };
const exerciseKey = (x: ExerciseKey) => setKey({ sessionId: x.sessionId, exerciseOrd: x.ord });

function readExercisesByKey(db: ExpoSQLiteDatabase, keys: ExerciseKey[]): Map<string, RecordedExercise> {
  if (!keys.length) {
    return new Map();
  }
  const isKey = (sessionId: SQLiteColumn, exerciseOrd: SQLiteColumn) =>
    or(...keys.map((key) => and(eq(sessionId, key.sessionId), eq(exerciseOrd, key.ord))));
  const sets = groupSetsByExercise(
    db
      .select()
      .from(weightedSetsSchema)
      .where(isKey(weightedSetsSchema.sessionId, weightedSetsSchema.exerciseOrd))
      .orderBy(weightedSetsSchema.ord)
      .all(),
    db
      .select()
      .from(cardioSetsSchema)
      .where(isKey(cardioSetsSchema.sessionId, cardioSetsSchema.exerciseOrd))
      .orderBy(cardioSetsSchema.ord)
      .all(),
  );
  return new Map(
    db
      .select()
      .from(recordedExercisesSchema)
      .where(isKey(recordedExercisesSchema.sessionId, recordedExercisesSchema.ord))
      .all()
      .map((exercise) => [exerciseKey(exercise), fromRecordedExerciseJSON(exerciseFromRows(exercise, sets))]),
  );
}

/**
 * The latest started performance of each lineage, before the session you are looking at. Only finished
 * sessions count, and `excludeSessionId` is left out too, because "previous" cannot mean the session you
 * are looking at.
 */
export function readPreviousExercises(
  db: ExpoSQLiteDatabase,
  progressionKeys: ProgressionKey[],
  excludeSessionId: string,
): Record<ProgressionKey, RecordedExercise | undefined> {
  return readLatestOfLineages(db, progressionKeys, and(isFinished, ne(sessionsSchema.id, excludeSessionId)));
}

/** When a session was performed: its last completed set, or the start of its date when it has none. */
const referenceMs = sql<number>`coalesce(${sessionsSchema.lastCompletedAtMs}, unixepoch(${sessionsSchema.date}, 'utc') * 1000)`;

export interface SessionVolume {
  id: string;
  date: LocalDate;
  volumeKg: number;
}

/**
 * Every finished session with a completed set, and the kilograms it moved: the SQL form of `sessionVolume`.
 * A cardio-only session moved nothing, so it has a volume of zero.
 */
export function readStartedSessionVolumes(db: ExpoSQLiteDatabase): SessionVolume[] {
  return db
    .select({ id: sessionsSchema.id, date: sessionsSchema.date, volumeKg: sessionsSchema.volumeKg })
    .from(sessionsSchema)
    .where(and(isFinished, isNotNull(sessionsSchema.lastCompletedAtMs)))
    .all()
    .map((row) => ({ id: row.id, date: fromLocalDateJSON(row.date), volumeKg: row.volumeKg }));
}

export interface PersonalRecordRow {
  sessionId: string;
  exerciseName: string;
  oneRepMaxKg: number;
}

/**
 * Records across every finished session: the SQL form of `findPersonalRecords`. A session holds one for a
 * movement when its best estimated one-rep max beats every earlier session's, and only if an earlier session
 * did that movement at all. Sessions are ordered by their last completed set.
 */
export function readPersonalRecords(db: ExpoSQLiteDatabase): PersonalRecordRow[] {
  const exercises = recordedExercisesSchema;
  const best = db
    .select({
      sessionId: exercises.sessionId,
      movementKey: exercises.movementKey,
      exerciseOrd: exercises.ord,
      exerciseName: exercises.name,
      oneRepMaxKg: sql<number>`max(${exercises.bestOneRepMaxKg})`.as('oneRepMaxKg'),
    })
    .from(exercises)
    .where(isNotNull(exercises.bestOneRepMaxKg))
    .groupBy(exercises.sessionId, exercises.movementKey)
    .as('best');
  const ranked = db
    .select({
      sessionId: best.sessionId,
      exerciseOrd: best.exerciseOrd,
      exerciseName: best.exerciseName,
      oneRepMaxKg: best.oneRepMaxKg,
      previousBestKg: sql<number | null>`max(${best.oneRepMaxKg}) over (
        partition by ${best.movementKey}
        order by ${sessionsSchema.lastCompletedAtMs}, ${best.sessionId}
        rows between unbounded preceding and 1 preceding
      )`.as('previousBestKg'),
    })
    .from(best)
    .innerJoin(sessionsSchema, eq(sessionsSchema.id, best.sessionId))
    .where(isFinished)
    .as('ranked');
  return db
    .select({ sessionId: ranked.sessionId, exerciseName: ranked.exerciseName, oneRepMaxKg: ranked.oneRepMaxKg })
    .from(ranked)
    .where(gt(ranked.oneRepMaxKg, ranked.previousBestKg))
    .orderBy(ranked.sessionId, ranked.exerciseOrd)
    .all();
}

export function readSessionToContinueFrom(
  db: ExpoSQLiteDatabase,
): { name: string; bodyweight: Weight | undefined } | undefined {
  const columns = {
    name: sessionsSchema.name,
    bodyweightValue: sessionsSchema.bodyweightValue,
    bodyweightUnit: sessionsSchema.bodyweightUnit,
  };
  const row =
    db.select(columns).from(sessionsSchema).where(eq(sessionsSchema.active, true)).get() ??
    db
      .select(columns)
      .from(sessionsSchema)
      .where(ne(sessionsSchema.name, freeformSessionName))
      .orderBy(desc(referenceMs))
      .limit(1)
      .get();
  if (!row) {
    return undefined;
  }
  const bodyweight = bodyweightFromColumns(row);
  return { name: row.name, bodyweight: bodyweight && Weight.fromJSON(bodyweight) };
}

/**
 * The finished session with the same name that was performed most recently before `before`, timed by its
 * last completed set, or the start of its date when it has none.
 */
export function readPreviousComparableSession(
  db: ExpoSQLiteDatabase,
  session: { id: string; name: string; before: OffsetDateTime },
): Session | undefined {
  const previous = db
    .select({ id: sessionsSchema.id })
    .from(sessionsSchema)
    .where(
      and(
        isFinished,
        ne(sessionsSchema.id, session.id),
        eq(sessionsSchema.name, session.name),
        lt(referenceMs, session.before.toInstant().toEpochMilli()),
      ),
    )
    .orderBy(desc(referenceMs))
    .limit(1)
    .get();
  return previous && readSession(db, previous.id);
}

export function readLatestExercises(
  db: ExpoSQLiteDatabase,
  progressionKeys: ProgressionKey[],
): Record<ProgressionKey, RecordedExercise | undefined> {
  return readLatestOfLineages(db, progressionKeys, undefined);
}

/** `where` may filter on the session and recorded exercise tables. */
function readLatestOfLineages(
  db: ExpoSQLiteDatabase,
  progressionKeys: ProgressionKey[],
  where: SQL | undefined,
): Record<ProgressionKey, RecordedExercise | undefined> {
  if (!progressionKeys.length) {
    return {};
  }
  const performed = lastCompletionPerExercise(
    db,
    and(where, inArray(recordedExercisesSchema.progressionKey, progressionKeys)),
  );
  const ranked = db
    .select({
      sessionId: performed.sessionId,
      ord: performed.ord,
      progressionKey: performed.progressionKey,
      recency: sql<number>`row_number() over (
        partition by ${performed.progressionKey}
        order by ${performed.completedAtMs} desc, ${performed.sessionId}, ${performed.ord}
      )`.as('recency'),
    })
    .from(performed)
    .as('ranked');
  const latest = db.select().from(ranked).where(eq(ranked.recency, 1)).all();
  const exercises = readExercisesByKey(db, latest);
  return Object.fromEntries(latest.map((row) => [row.progressionKey, exercises.get(exerciseKey(row))]));
}

function deleteChildren(tx: ExpoSQLiteDatabase, sessionId: string) {
  tx.delete(weightedSetsSchema).where(eq(weightedSetsSchema.sessionId, sessionId)).run();
  tx.delete(cardioSetsSchema).where(eq(cardioSetsSchema.sessionId, sessionId)).run();
  tx.delete(recordedExercisesSchema).where(eq(recordedExercisesSchema.sessionId, sessionId)).run();
}

const sessionColumns = getTableColumns(sessionsSchema);
const contentColumns = Object.keys(sessionColumns).filter(
  (key): key is Exclude<keyof SessionRow, 'id' | 'active' | SummaryColumn> =>
    key !== 'id' &&
    key !== 'active' &&
    !summaryColumns.includes(key as SummaryColumn) &&
    !sessionColumns[key as keyof typeof sessionColumns].generated,
);

/** What the whole-history reads need from a session, stored with it so they never visit its sets. */
function writeSummary(tx: ExpoSQLiteDatabase, sessionId: string) {
  const sets = effectiveWeightedSetsView;
  const completed = and(eq(sets.sessionId, sessionId), isNotNull(sets.completedAtMs));
  const bests = tx
    .select({
      ord: sets.exerciseOrd,
      oneRepMaxKg: sql<number>`max(${sets.effectiveKg} * (1 + ${sets.repsCompleted} / 30.0))`,
    })
    .from(sets)
    .where(and(completed, ne(sets.resistance, 'none'), gt(sets.repsCompleted, 0)))
    .groupBy(sets.exerciseOrd)
    .all();
  for (const best of bests) {
    tx.update(recordedExercisesSchema)
      .set({ bestOneRepMaxKg: best.oneRepMaxKg })
      .where(and(eq(recordedExercisesSchema.sessionId, sessionId), eq(recordedExercisesSchema.ord, best.ord)))
      .run();
  }

  const lastCompletion = (table: SetsTable) =>
    tx
      .select({ completedAtMs: max(table.completedAtMs) })
      .from(table)
      .where(eq(table.sessionId, sessionId))
      .get()?.completedAtMs ?? null;
  const completions = [lastCompletion(weightedSetsSchema), lastCompletion(cardioSetsSchema)].filter(
    (x): x is number => x !== null,
  );
  const volume = tx
    .select({ volumeKg: sql<number>`coalesce(sum(${sets.effectiveKg} * ${sets.repsCompleted}), 0)` })
    .from(sets)
    .where(completed)
    .get();
  tx.update(sessionsSchema)
    .set({
      volumeKg: volume?.volumeKg ?? 0,
      lastCompletedAtMs: completions.length ? Math.max(...completions) : null,
    })
    .where(eq(sessionsSchema.id, sessionId))
    .run();
}

export function writeSummaries(tx: ExpoSQLiteDatabase, sessionIds: string[]) {
  sessionIds.forEach((id) => writeSummary(tx, id));
}

export function writeSession(tx: ExpoSQLiteDatabase, session: Session) {
  const rows = sessionToRows(session);
  tx.insert(sessionsSchema)
    .values(rows.session)
    .onConflictDoUpdate({
      target: sessionsSchema.id,
      set: Object.fromEntries(contentColumns.map((key) => [key, sql.raw(`excluded.${sessionsSchema[key].name}`)])),
    })
    .run();
  deleteChildren(tx, session.id);
  if (rows.exercises.length) {
    tx.insert(recordedExercisesSchema).values(rows.exercises).run();
  }
  if (rows.weightedSets.length) {
    tx.insert(weightedSetsSchema).values(rows.weightedSets).run();
  }
  if (rows.cardioSets.length) {
    tx.insert(cardioSetsSchema).values(rows.cardioSets).run();
  }
  writeSummary(tx, session.id);
}

export function deleteSession(tx: ExpoSQLiteDatabase, sessionId: string) {
  deleteChildren(tx, sessionId);
  tx.delete(sessionsSchema).where(eq(sessionsSchema.id, sessionId)).run();
}

export function setActiveSession(tx: ExpoSQLiteDatabase, session: Session | undefined) {
  tx.update(sessionsSchema).set({ active: false }).where(eq(sessionsSchema.active, true)).run();
  if (!session) {
    return;
  }
  writeSession(tx, session);
  tx.update(sessionsSchema).set({ active: true }).where(eq(sessionsSchema.id, session.id)).run();
}
