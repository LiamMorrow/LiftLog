import { Session } from '@/models/session-models';
import { AnyVersionSessionJSON } from '@/models/storage/versions/any';
import {
  DurationJSON,
  fromDurationJSON,
  fromOffsetDateTimeJSON,
  OffsetDateTimeJSON,
  RestJSON,
} from '@/models/storage/versions/latest';
import { sessionMigrations } from '@/models/storage/versions/migrations';
import type { JsMigration } from '@/services/js-migrations';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

const sessionLegacy = sqliteTable('session_legacy', {
  id: text().primaryKey(),
  active: integer({ mode: 'boolean' }).notNull(),
  payload: text({ mode: 'json' }).$type<AnyVersionSessionJSON>().notNull(),
});

const session = sqliteTable('session', {
  id: text().primaryKey(),
  name: text().notNull(),
  notes: text().notNull(),
  date: text().notNull(),
  active: integer({ mode: 'boolean' }).notNull(),
  bodyweightValue: text(),
  bodyweightUnit: text(),
});

const recordedExercise = sqliteTable('recorded_exercise', {
  sessionId: text().notNull(),
  ord: integer().notNull(),
  type: text().notNull(),
  notes: text(),
  movementKey: text().notNull(),
  progressionKey: text().notNull(),
  name: text().notNull(),
  blueprintNotes: text().notNull(),
  link: text().notNull(),
  restMinMs: integer(),
  restMaxMs: integer(),
  restFailureMs: integer(),
  supersetWithNext: integer({ mode: 'boolean' }),
  resistance: text(),
  plannedSets: text({ mode: 'json' }),
  progression: text({ mode: 'json' }),
});

const weightedSet = sqliteTable('weighted_set', {
  sessionId: text().notNull(),
  exerciseOrd: integer().notNull(),
  ord: integer().notNull(),
  targetMin: integer().notNull(),
  targetMax: integer().notNull(),
  weightValue: text().notNull(),
  weightUnit: text().notNull(),
  repsCompleted: integer(),
  completedAt: text(),
  completedAtMs: integer(),
});

const cardioSet = sqliteTable('cardio_set', {
  sessionId: text().notNull(),
  exerciseOrd: integer().notNull(),
  ord: integer().notNull(),
  targetType: text().notNull(),
  targetDurationMs: integer(),
  targetDistanceValue: text(),
  targetDistanceUnit: text(),
  trackDuration: integer({ mode: 'boolean' }).notNull(),
  trackDistance: integer({ mode: 'boolean' }).notNull(),
  trackResistance: integer({ mode: 'boolean' }).notNull(),
  trackIncline: integer({ mode: 'boolean' }).notNull(),
  trackWeight: integer({ mode: 'boolean' }).notNull(),
  trackSteps: integer({ mode: 'boolean' }).notNull(),
  restMinMs: integer(),
  restMaxMs: integer(),
  restFailureMs: integer(),
  completedAt: text(),
  completedAtMs: integer(),
  durationMs: integer(),
  distanceValue: text(),
  distanceUnit: text(),
  resistance: text(),
  incline: text(),
  weightValue: text(),
  weightUnit: text(),
  steps: integer(),
});

const toMs = (duration: DurationJSON) => fromDurationJSON(duration).toMillis();
const toEpochMs = (time: OffsetDateTimeJSON) => fromOffsetDateTimeJSON(time).toInstant().toEpochMilli();
const nullable = <T>(value: T | undefined): T | null => value ?? null;

const restColumns = (rest: RestJSON | undefined) => ({
  restMinMs: rest ? toMs(rest.minRest) : null,
  restMaxMs: rest ? toMs(rest.maxRest) : null,
  restFailureMs: rest ? toMs(rest.failureRest) : null,
});

function explode(tx: Parameters<JsMigration['run']>[0], domain: Session, active: boolean) {
  const json = domain.toJSON();
  tx.insert(session)
    .values({
      id: json.id,
      name: json.blueprint.name,
      notes: json.blueprint.notes,
      date: json.date,
      active,
      bodyweightValue: nullable(json.bodyweight?.value),
      bodyweightUnit: nullable(json.bodyweight?.unit),
    })
    .run();

  const exercises: (typeof recordedExercise.$inferInsert)[] = [];
  const weightedSets: (typeof weightedSet.$inferInsert)[] = [];
  const cardioSets: (typeof cardioSet.$inferInsert)[] = [];

  json.recordedExercises.forEach((exercise, exerciseOrd) => {
    const recorded = domain.recordedExercises[exerciseOrd]!;
    const shared = {
      sessionId: json.id,
      ord: exerciseOrd,
      type: exercise.type,
      notes: nullable(exercise.notes),
      movementKey: recorded.movementKey(),
      progressionKey: recorded.progressionKey(),
      name: exercise.blueprint.name,
      blueprintNotes: exercise.blueprint.notes,
      link: exercise.blueprint.link,
    };
    const setKey = (ord: number) => ({ sessionId: json.id, exerciseOrd, ord });

    if (exercise.type === 'RecordedWeightedExercise') {
      const { blueprint } = exercise;
      exercises.push({
        ...shared,
        ...restColumns(blueprint.restBetweenSets),
        supersetWithNext: blueprint.supersetWithNext,
        resistance: blueprint.resistance,
        plannedSets: blueprint.plannedSets,
        progression: blueprint.progression,
      });
      exercise.potentialSets.forEach((set, ord) =>
        weightedSets.push({
          ...setKey(ord),
          targetMin: set.target.reps.min,
          targetMax: set.target.reps.max,
          weightValue: set.weight.value,
          weightUnit: set.weight.unit,
          repsCompleted: nullable(set.set?.repsCompleted),
          completedAt: nullable(set.set?.completionDateTime),
          completedAtMs: set.set ? toEpochMs(set.set.completionDateTime) : null,
        }),
      );
      return;
    }

    exercises.push({ ...shared, ...restColumns(undefined) });
    exercise.sets.forEach((set, ord) => {
      const { target } = set.blueprint;
      cardioSets.push({
        ...setKey(ord),
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
        ...restColumns(set.blueprint.restBetweenSets),
        completedAt: nullable(set.completionDateTime),
        completedAtMs: set.completionDateTime ? toEpochMs(set.completionDateTime) : null,
        durationMs: set.duration ? toMs(set.duration) : null,
        distanceValue: nullable(set.distance?.value),
        distanceUnit: nullable(set.distance?.unit),
        resistance: nullable(set.resistance),
        incline: nullable(set.incline),
        weightValue: nullable(set.weight?.value),
        weightUnit: nullable(set.weight?.unit),
        steps: nullable(set.steps),
      });
    });
  });

  if (exercises.length) {
    tx.insert(recordedExercise).values(exercises).run();
  }
  if (weightedSets.length) {
    tx.insert(weightedSet).values(weightedSets).run();
  }
  if (cardioSets.length) {
    tx.insert(cardioSet).values(cardioSets).run();
  }
}

export const explodeSessions: JsMigration = {
  id: 'EXPLODE_SESSIONS',
  after: '0009_relational_sessions',
  run: (tx) => {
    for (const row of tx.select().from(sessionLegacy).all()) {
      explode(tx, Session.fromJSON(sessionMigrations.migrate(row.payload)), row.active);
    }
  },
};
