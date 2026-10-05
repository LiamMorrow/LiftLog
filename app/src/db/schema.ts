import {
  AnyVersionExerciseDescriptorJSON,
  AnyVersionFeedIdentityJSON,
  AnyVersionFollowedFeedUserJSON,
  AnyVersionFollowerFeedUserJSON,
  AnyVersionFollowRequestInboxMessageJSON,
  AnyVersionPendingFeedUserJSON,
  AnyVersionProgramBlueprintJSON,
  AnyVersionReceivedReactionJSON,
  AnyVersionSentReactionJSON,
  AnyVersionSessionJSON,
  AnyVersionSessionUserEventJSON,
} from '@/models/storage/versions/any';
import { BackendFeature, BackendKind } from '@/models/backend';
import { MovementKey, ProgressionKey } from '@/models/blueprint-models';
import type {
  BigNumberJSON,
  CardioTargetJSON,
  DistanceUnitJSON,
  LocalDateJSON,
  OffsetDateTimeJSON,
  PlannedSetJSON,
  ProgressionRuleJSON,
  RecordedExerciseJSON,
  ResistanceJSON,
} from '@/models/storage/versions/latest';
import type { WeightUnitJSON } from '@/models/storage/versions/libs/weight';
import { and, eq, SQL, sql } from 'drizzle-orm';
import {
  check,
  foreignKey,
  index,
  integer,
  primaryKey,
  real,
  SQLiteColumn,
  sqliteTable,
  sqliteView,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

/**
 * A stored weight in kilograms, for aggregating in SQL. REAL loses BigNumber's exactness, which is fine for
 * sums and comparisons. The factor matches `Weight.convertTo`.
 */
function kilograms(value: SQLiteColumn, unit: SQLiteColumn): SQL {
  return sql`CASE ${unit} WHEN 'pounds' THEN CAST(${value} AS REAL) / 2.20462 ELSE CAST(${value} AS REAL) END`;
}

export const sessionLegacySchema = sqliteTable('session_legacy', {
  id: text().primaryKey(),
  active: integer({ mode: 'boolean' }).notNull().default(false),
  payload: text('payload', { mode: 'json' }).$type<AnyVersionSessionJSON>().notNull(),
});

export const sessionsSchema = sqliteTable(
  'session',
  {
    id: text().primaryKey(),
    name: text().notNull(),
    notes: text().notNull(),
    date: text().$type<LocalDateJSON>().notNull(),
    // The workout currently in progress, if any. At most one row may be active.
    active: integer({ mode: 'boolean' }).notNull().default(false),
    bodyweightValue: text().$type<BigNumberJSON>(),
    bodyweightUnit: text().$type<WeightUnitJSON>(),
    bodyweightKg: real().generatedAlwaysAs(
      (): SQL => kilograms(sessionsSchema.bodyweightValue, sessionsSchema.bodyweightUnit),
      { mode: 'virtual' },
    ),
    volumeKg: real().notNull().default(0),
    lastCompletedAtMs: integer(),
  },
  (table) => [
    uniqueIndex('single_active_session')
      .on(table.active)
      .where(sql`${table.active} = 1`),
    index('session_date').on(table.date),
  ],
);

export const recordedExercisesSchema = sqliteTable(
  'recorded_exercise',
  {
    sessionId: text()
      .notNull()
      .references(() => sessionsSchema.id, { onDelete: 'cascade' }),
    ord: integer().notNull(),
    type: text().$type<RecordedExerciseJSON['type']>().notNull(),
    notes: text(),
    movementKey: text().$type<MovementKey>().notNull(),
    progressionKey: text().$type<ProgressionKey>().notNull(),
    name: text().notNull(),
    blueprintNotes: text().notNull(),
    link: text().notNull(),
    restMinMs: integer(),
    restMaxMs: integer(),
    restFailureMs: integer(),
    supersetWithNext: integer({ mode: 'boolean' }),
    resistance: text().$type<ResistanceJSON>(),
    plannedSets: text({ mode: 'json' }).$type<PlannedSetJSON[]>(),
    progression: text({ mode: 'json' }).$type<ProgressionRuleJSON[]>(),
    bestOneRepMaxKg: real(),
  },
  (table) => [
    primaryKey({ columns: [table.sessionId, table.ord] }),
    index('recorded_exercise_movement_key').on(table.movementKey),
    index('recorded_exercise_progression_key').on(table.progressionKey),
  ],
);

export const weightedSetsSchema = sqliteTable(
  'weighted_set',
  {
    sessionId: text().notNull(),
    exerciseOrd: integer().notNull(),
    ord: integer().notNull(),
    targetMin: integer().notNull(),
    targetMax: integer().notNull(),
    weightValue: text().$type<BigNumberJSON>().notNull(),
    weightUnit: text().$type<WeightUnitJSON>().notNull(),
    weightKg: real().generatedAlwaysAs(
      (): SQL => kilograms(weightedSetsSchema.weightValue, weightedSetsSchema.weightUnit),
      { mode: 'virtual' },
    ),
    repsCompleted: integer(),
    completedAt: text().$type<OffsetDateTimeJSON>(),
    completedAtMs: integer(),
  },
  (table) => [
    primaryKey({ columns: [table.sessionId, table.exerciseOrd, table.ord] }),
    foreignKey({
      columns: [table.sessionId, table.exerciseOrd],
      foreignColumns: [recordedExercisesSchema.sessionId, recordedExercisesSchema.ord],
    }).onDelete('cascade'),
  ],
);

export const cardioSetsSchema = sqliteTable(
  'cardio_set',
  {
    sessionId: text().notNull(),
    exerciseOrd: integer().notNull(),
    ord: integer().notNull(),
    targetType: text().$type<CardioTargetJSON['type']>().notNull(),
    targetDurationMs: integer(),
    targetDistanceValue: text().$type<BigNumberJSON>(),
    targetDistanceUnit: text().$type<DistanceUnitJSON>(),
    trackDuration: integer({ mode: 'boolean' }).notNull(),
    trackDistance: integer({ mode: 'boolean' }).notNull(),
    trackResistance: integer({ mode: 'boolean' }).notNull(),
    trackIncline: integer({ mode: 'boolean' }).notNull(),
    trackWeight: integer({ mode: 'boolean' }).notNull(),
    trackSteps: integer({ mode: 'boolean' }).notNull(),
    restMinMs: integer(),
    restMaxMs: integer(),
    restFailureMs: integer(),
    completedAt: text().$type<OffsetDateTimeJSON>(),
    completedAtMs: integer(),
    durationMs: integer(),
    distanceValue: text().$type<BigNumberJSON>(),
    distanceUnit: text().$type<DistanceUnitJSON>(),
    resistance: text().$type<BigNumberJSON>(),
    incline: text().$type<BigNumberJSON>(),
    weightValue: text().$type<BigNumberJSON>(),
    weightUnit: text().$type<WeightUnitJSON>(),
    steps: integer(),
  },
  (table) => [
    primaryKey({ columns: [table.sessionId, table.exerciseOrd, table.ord] }),
    foreignKey({
      columns: [table.sessionId, table.exerciseOrd],
      foreignColumns: [recordedExercisesSchema.sessionId, recordedExercisesSchema.ord],
    }).onDelete('cascade'),
  ],
);

/**
 * Each weighted set with the load it actually moved, in kilograms - the SQL form of
 * `RecordedWeightedExercise.effectiveWeight`. A bodyweight exercise adds the session's bodyweight, or nothing
 * when none was recorded.
 */
export const effectiveWeightedSetsView = sqliteView('effective_weighted_set').as((qb) =>
  qb
    .select({
      sessionId: weightedSetsSchema.sessionId,
      exerciseOrd: weightedSetsSchema.exerciseOrd,
      // Aliased, because drizzle cannot name a joined table's column when it is read back through a view.
      movementKey: sql<MovementKey>`${recordedExercisesSchema.movementKey}`.as('movementKey'),
      exerciseName: sql<string>`${recordedExercisesSchema.name}`.as('exerciseName'),
      resistance: sql<ResistanceJSON | null>`${recordedExercisesSchema.resistance}`.as('resistance'),
      repsCompleted: weightedSetsSchema.repsCompleted,
      completedAtMs: weightedSetsSchema.completedAtMs,
      effectiveKg: sql<number>`CASE ${recordedExercisesSchema.resistance}
        WHEN 'none' THEN 0
        WHEN 'bodyweight' THEN coalesce(${sessionsSchema.bodyweightKg}, 0) + ${weightedSetsSchema.weightKg}
        ELSE ${weightedSetsSchema.weightKg}
      END`.as('effectiveKg'),
    })
    .from(weightedSetsSchema)
    .innerJoin(
      recordedExercisesSchema,
      and(
        eq(recordedExercisesSchema.sessionId, weightedSetsSchema.sessionId),
        eq(recordedExercisesSchema.ord, weightedSetsSchema.exerciseOrd),
      ),
    )
    .innerJoin(sessionsSchema, eq(sessionsSchema.id, weightedSetsSchema.sessionId)),
);

export const exercisesSchema = sqliteTable('exercise', {
  id: text().primaryKey(),
  payload: text('payload', { mode: 'json' }).$type<AnyVersionExerciseDescriptorJSON>().notNull(),
});

export const programsSchema = sqliteTable(
  'program',
  {
    id: text().primaryKey(),
    active: integer({ mode: 'boolean' }).notNull(),
    payload: text('payload', { mode: 'json' }).$type<AnyVersionProgramBlueprintJSON>().notNull(),
  },
  (table) => [
    uniqueIndex('single_active_program')
      .on(table.active)
      .where(sql`${table.active} = 1`),
  ],
);

export const feedIdentitySchema = sqliteTable(
  'feed_identity',
  {
    id: integer().primaryKey(),
    payload: text('payload', { mode: 'json' }).$type<AnyVersionFeedIdentityJSON>().notNull(),
  },
  () => [check('single_feed_identity', sql`id = 0`)],
);

export const feedFollowedUsersSchema = sqliteTable('feed_followed_user', {
  id: text().primaryKey(),
  payload: text('payload', { mode: 'json' }).$type<AnyVersionFollowedFeedUserJSON>().notNull(),
});
export const feedPendingUsersSchema = sqliteTable('feed_pending_user', {
  id: text().primaryKey(),
  payload: text('payload', { mode: 'json' }).$type<AnyVersionPendingFeedUserJSON>().notNull(),
});
export const feedItemsSchema = sqliteTable('feed_items', {
  id: text().primaryKey(),
  payload: text('payload', { mode: 'json' }).$type<AnyVersionSessionUserEventJSON>().notNull(),
});

export const feedFollowerUsersSchema = sqliteTable('feed_follower_user', {
  id: text().primaryKey(),
  payload: text('payload', { mode: 'json' }).$type<AnyVersionFollowerFeedUserJSON>().notNull(),
});

export const feedFollowRequestsSchema = sqliteTable('feed_follow_request', {
  id: text().primaryKey(),
  payload: text('payload', { mode: 'json' }).$type<AnyVersionFollowRequestInboxMessageJSON>().notNull(),
});

// id is the reactionId, so a redelivered cheer upserts over itself instead of inflating the count.
export const feedReactionsSchema = sqliteTable('feed_reaction', {
  id: text().primaryKey(),
  payload: text('payload', { mode: 'json' }).$type<AnyVersionReceivedReactionJSON>().notNull(),
});

export const feedSentReactionsSchema = sqliteTable('feed_sent_reaction', {
  id: text().primaryKey(),
  payload: text('payload', { mode: 'json' }).$type<AnyVersionSentReactionJSON>().notNull(),
});

export const feedRevokedFollowSecretsSchema = sqliteTable('feed_revoked_follow_secrets', {
  secret: text().primaryKey(),
});
export const feedUnpublishedSessionsSchema = sqliteTable('feed_unpublished_sessions', {
  sessionId: text().primaryKey(),
});

// Just a table we can use to keep track of which data migrations have been run
export const dataMigrationsSchema = sqliteTable('data_migration', {
  id: text().primaryKey(),
});

export const backendsSchema = sqliteTable('backend', {
  id: text().primaryKey(),
  name: text().notNull(),
  url: text().notNull(),
  kind: text().$type<BackendKind>().notNull(),
});

export const backendHeadersSchema = sqliteTable(
  'backend_header',
  {
    backendId: text()
      .notNull()
      .references(() => backendsSchema.id, { onDelete: 'cascade' }),
    name: text().notNull(),
    value: text().notNull(),
  },
  (table) => [primaryKey({ columns: [table.backendId, table.name] })],
);

// A missing row means the feature has no backend and does not run.
export const backendAssignmentsSchema = sqliteTable('backend_assignment', {
  feature: text().$type<BackendFeature>().primaryKey(),
  backendId: text().notNull(),
});
