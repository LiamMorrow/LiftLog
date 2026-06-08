/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { TupleIndices } from '@/utils/tuple';

/**
 * Represents a single schema migration step from one version's shape to the next.
 *
 * The `$type` field is never populated at runtime — it exists solely as a
 * phantom type carrier so that `Migrator` and friends can infer the output
 * type of each step from the tuple of migrations without running any code.
 *
 * @typeParam TInput  - Shape of the data coming *in* to this migration
 * @typeParam TOutput - Shape of the data coming *out* of this migration
 *
 * @example
 * const m: Migration<{ version: 1; name: string }, { version: 2; name: string; age: number }> = {
 *   $type: undefined!,
 *   up: (state) => ({ ...state, age: 0, version: 2 }),
 * };
 */
export type Migration<TInput = unknown, TOutput = unknown> = {
  /** Phantom field — never set at runtime. Carries `TOutput` into the type system. */
  $type: TOutput;
  up: (state: TInput) => TOutput;
};

/**
 * Convenience alias for a {@link Migration} with both type parameters erased to `any`.
 * Used internally where the specific input/output shapes don't matter.
 */
type AnyMigration = Migration<any, any>;

/**
 * Fluent builder returned by {@link createMigrations} and each subsequent `.add()` call.
 *
 * Each call to `.add()` appends one migration step and returns a new builder whose
 * `TPrevOutput` advances to the output of that step, keeping the accumulated tuple
 * of migrations fully typed at compile time.
 *
 * @typeParam TPrevOutput   - The output shape produced by the most-recently-added migration
 * @typeParam TAccumulated  - The readonly tuple of all migrations added so far
 */
type MigrationsBuilder<
  TPrevOutput,
  TAccumulated extends readonly [
    ...AnyMigration[],
    Migration<any, TPrevOutput>,
  ],
> = {
  /**
   * Appends a migration that transforms the previous output shape into `TNext`.
   *
   * The `version` field is intentionally excluded from both the input and output
   * signatures — the builder manages version stamping automatically, incrementing
   * it by 1 for each step.
   *
   * @typeParam TNext - The new output shape after this migration runs
   * @param up        - Pure function mapping the old shape (minus `version`) to the new shape (minus `version`)
   * @returns A new builder with `TNext` as its `TPrevOutput` and the new migration appended to `TAccumulated`
   *
   * @example
   * createMigrations<{ version: number; name: string }>()
   *   .add((prev) => ({
   *     name: prev.name,
   *     displayName: prev.name.toUpperCase(), // new field
   *   }))
   *   .build();
   */
  add<TNext>(
    up: (state: TPrevOutput) => TNext & { version: TAccumulated['length'] },
  ): MigrationsBuilder<
    TNext,
    readonly [...TAccumulated, Migration<TPrevOutput, TNext>]
  >;

  /**
   * Finalises the builder and returns a {@link Migrator} over the accumulated migrations.
   *
   * @returns A {@link Migrator} whose `$type` reflects the final output shape
   */
  build(): Migrator<TPrevOutput, TAccumulated>;
};

/**
 * Concrete implementation of {@link MigrationsBuilder}.
 *
 * Not exported — consumers interact through the {@link MigrationsBuilder} interface
 * returned by {@link createMigrations}.
 */
class MigrationBuilderImpl<
  TPrevOutput,
  TAccumulated extends readonly [...AnyMigration[], AnyMigration],
> implements MigrationsBuilder<TPrevOutput, TAccumulated> {
  constructor(private previousValues: AnyMigration[]) {}

  add<TNext>(
    up: (state: TPrevOutput) => TNext,
  ): MigrationsBuilder<
    TNext,
    readonly [...TAccumulated, Migration<TPrevOutput, TNext>]
  > {
    const lastMigration = this.previousValues.at(-1);
    if (!lastMigration) {
      throw new Error('Bad migration');
    }
    return new MigrationBuilderImpl<
      TNext,
      readonly [...TAccumulated, Migration<TPrevOutput, TNext>]
    >([
      ...this.previousValues,
      {
        $type: undefined!,
        up,
      },
    ]);
  }

  build(): Migrator<TPrevOutput, TAccumulated> {
    return new MigratorImpl<TPrevOutput, TAccumulated>(
      this.previousValues as any,
    );
  }
}

class MigratorImpl<
  TFinal,
  TMigrations extends readonly [...AnyMigration[], Migration<any, TFinal>],
> implements Migrator<TFinal, TMigrations> {
  $finalType: TFinal = undefined!;
  $anyType: TMigrations[number]['$type'] = undefined!;
  readonly latestVersion: number;

  constructor(private migrations: TMigrations) {
    this.latestVersion = this.migrations.length;
  }
  migrate(value: TMigrations[number]['$type']): TFinal {
    return this.migrateUntil(value, this.migrations.length as any);
  }

  migrateUntil<TVersion extends TupleIndices<TMigrations>>(
    value: TMigrations[number]['$type'],
    maxVersion: TVersion,
  ): TMigrations[TVersion]['$type'] {
    const currentVersion = value.version ?? 0;
    if (!this.migrations.length || currentVersion >= maxVersion) {
      return value;
    }
    let migratedValue = value;
    for (const [index, migration] of this.migrations.entries()) {
      const migrationVersion = index + 1;
      const currentVersion = migratedValue.version ?? 0;
      if (currentVersion < migrationVersion && currentVersion < maxVersion) {
        migratedValue = migration.up(migratedValue);
      }
    }
    return migratedValue;
  }
}

/**
 * Applies a chain of ordered schema migrations to bring persisted data up to the
 * latest version (or any intermediate version).
 *
 * Instances are not constructed directly — use {@link createMigrations} to build one.
 *
 * Version numbers are 1-based and correspond to tuple positions:
 * - Index 0 → identity no-op (inserted by `createMigrations`)
 * - Index 1 → first `.add()` call → produces version 1
 * - Index N → Nth `.add()` call → produces version N
 *
 * @typeParam TFinal      - The output type of the last migration in the chain
 * @typeParam TMigrations - The full readonly tuple of migrations, used for per-index type lookups
 *
 * @example
 * const migrator = createMigrations<V1>().add(v1ToV2).add(v2ToV3).build();
 *
 * // Bring any persisted value up to the latest version:
 * const latest: V3 = migrator.migrate(stored);
 *
 * // Extract the final type without running anything:
 * type Latest = typeof migrator.$type; // V3
 */
interface Migrator<
  TFinal,
  TMigrations extends readonly [...AnyMigration[], Migration<any, TFinal>],
> {
  /**
   * Phantom field — never set at runtime.
   * Carries `TFinal` so callers can write `typeof migrator.$type` to obtain the
   * latest version's type without importing it explicitly.
   *
   * @example
   * export type LatestSessionJSON = typeof sessionMigrations.$type;
   */
  $finalType: TFinal;
  $anyType: TMigrations[number]['$type'];

  latestVersion: TMigrations['length'];

  /**
   * Migrates `value` through every step, returning the final output type.
   *
   * Equivalent to `migrateUntil(value, migrations.length)`.
   *
   * @param value - Any intermediate version of the persisted value
   * @returns The fully-migrated value at the latest version
   *
   * @example
   * const latest = migrator.migrate(JSON.parse(stored));
   */
  migrate(value: TMigrations[number]['$type']): TFinal;

  /**
   * Migrates `value` only up to (but not past) `maxVersion`.
   *
   * The return type is narrowed to the output type of the migration at index
   * `maxVersion`, giving callers a compile-time guarantee about what shape
   * they'll receive.
   *
   * This is useful when one migrator's output feeds into another as an
   * intermediate step — for example, when a parent entity embeds a child
   * entity that has its own independent migration chain.
   *
   * @param value      - Any intermediate version of the persisted value
   * @param maxVersion - Tuple index (1-based) to stop at; constrained to valid indices by `TupleIndices`
   * @returns The migrated value, typed as the output of migration at `maxVersion`
   *
   * @example
   * // Migrate child entities only to version 1 when building a parent's migration:
   * .add((parent) => ({
   *   ...parent,
   *   children: parent.children.map((c) =>
   *     childMigrations.migrateUntil(c, 1)
   *   ),
   * }))
   */
  migrateUntil<TVersion extends TupleIndices<TMigrations>>(
    value: TMigrations[number]['$type'],
    maxVersion: TVersion,
  ): TMigrations[TVersion]['$type'];
}

/**
 * Entry point for defining a versioned migration chain.
 *
 * Call `.add()` once per schema version bump to describe how to transform data
 * from the previous version's shape into the next.
 * Finish the chain with `.build()` to obtain a {@link Migrator}.
 *
 * The first migration in the chain is always an identity step (v0 → v1 = `TInitial`),
 * injected automatically. Each subsequent `.add()` call adds one version.
 *
 * @typeParam TInitial - The shape of version-1 data (i.e. the *oldest* persisted format)
 * @returns A {@link MigrationsBuilder} seeded with the identity step
 *
 * @example
 * // Define types for the initial stored version:
 * type V1 = { name: string };
 *
 * const migrator = createMigrations<V1>()
 *   // V1 → V2: add displayName derived from name
 *   .add((v1) => ({
 *     version: 2,
 *     name: v1.name,
 *     displayName: v1.name.toUpperCase(),
 *   }))
 *   // V2 → V3: add age with a default
 *   .add((v2) => ({
 *     version: 3,
 *     name: v2.name,
 *     displayName: v2.displayName,
 *     age: 0,
 *   }))
 *   .build();
 *
 * // Bring any persisted value up to the latest version:
 * const latest = migrator.migrate(storedValue); // typed as V3
 *
 * // Derive the latest type for use elsewhere:
 * export type LatestV = typeof migrator.$type; // V3
 */
export function createMigrations<TInitial>(): MigrationsBuilder<
  TInitial,
  [Migration<unknown, never>, Migration<unknown, TInitial>]
> {
  return new MigrationBuilderImpl([
    {
      $type: undefined!,
      up: (x) => x as TInitial,
    },
  ]);
}
