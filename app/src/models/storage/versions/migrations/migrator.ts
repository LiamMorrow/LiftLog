// oxlint-disable typescript/no-unsafe-return typescript/no-unsafe-assignment typescript/no-unsafe-member-access typescript/no-unsafe-argument
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
 */
export type Migration<TInput = unknown, TOutput = unknown> = {
  /** Phantom field — never set at runtime. Carries `TOutput` into the type system. */
  $type: TOutput;
  up: (state: TInput) => TOutput;
};

/** A {@link Migration} with both type parameters erased. */
type AnyMigration = Migration<any, any>;

/** A {@link Migrator} with every type parameter erased — used to hold declared child dependencies. */
type AnyMigrator = Migrator<any, any, any>;

/**
 * `true` when `A` is assignable to `B`, else `false`. Wrapped in tuples to
 * avoid distributing over unions.
 */
type Assignable<A, B> = [A] extends [B] ? true : false;

/**
 * `true` only when `A` and `B` are mutually assignable. Used by `.build()` to
 * assert that a chain's accumulated output matches the hand-declared latest type.
 */
type MutuallyAssignable<A, B> = Assignable<A, B> extends true ? Assignable<B, A> : false;

/**
 * The latest shape of a single dependent field: an array of latest children when the
 * field holds a list, otherwise a single latest child (preserving a `null`/`undefined`
 * union so optional embeds stay optional).
 */
type DependentFieldLatest<TField, TChild extends AnyMigrator> = TField extends readonly any[]
  ? TChild['$finalType'][]
  : TChild['$finalType'] | Extract<TField, undefined | null>;

/** The any-stored-version shape of a single dependent field (mirrors {@link DependentFieldLatest}). */
type DependentFieldAny<TField, TChild extends AnyMigrator> = TField extends readonly any[]
  ? TChild['$anyType'][]
  : TChild['$anyType'] | Extract<TField, undefined | null>;

/**
 * The latest shape a wrapper produces: its base shape with every declared dependent field
 * replaced by its latest child shape. Homomorphic so optional fields keep their `?` modifier.
 * The `version` literal is contributed at `.build()` from the declared latest type via
 * {@link VersionOf}, so `pseudoMigrateUntil` stays a runtime concern.
 */
type DependentsLatest<TBase, TDeps extends Record<string, AnyMigrator>> = {
  [K in keyof TBase]: K extends keyof TDeps ? DependentFieldLatest<TBase[K], TDeps[K]> : TBase[K];
};

/** The `version` slice of a declared latest type, or nothing if it carries no version. */
type VersionOf<TFinal> = TFinal extends { version: infer V } ? { version: V } : object;

/** The any-stored-version input a wrapper accepts (mirrors {@link DependentsLatest}). */
type DependentsAny<TBase, TDeps extends Record<string, AnyMigrator>> = {
  [K in keyof TBase]: K extends keyof TDeps ? DependentFieldAny<TBase[K], TDeps[K]> : TBase[K];
} & { version?: number };

/**
 * Fluent builder returned by {@link createMigrations} and each `.add()` call.
 *
 * @typeParam TPrevOutput    - The output shape produced by the most-recently-added migration
 * @typeParam TAccumulated   - The readonly tuple of all migrations added so far
 * @typeParam TPseudoVersion - The `pseudoMigrateUntil` version literal (for wrappers with no numbered steps)
 */
type MigrationsBuilder<TPrevOutput, TAccumulated extends readonly [...AnyMigration[], Migration<any, TPrevOutput>]> = {
  /**
   * Appends a numbered migration transforming the previous output shape into `TNext`.
   * The builder stamps `version` automatically (incrementing by 1 per step).
   */
  add<TNext>(
    up: (state: TPrevOutput) => TNext & { version: TAccumulated['length'] },
  ): MigrationsBuilder<TNext, readonly [...TAccumulated, Migration<TPrevOutput, TNext>]>;

  /**
   * Declares the child migrators this model embeds, keyed by the field that holds them.
   *
   * Every declared field is brought up to its child's latest version on `migrate()`, so this
   * model never needs a numbered step merely because a child's shape changed, and a child bump
   * is picked up automatically (per leaf) rather than tracked by a single scalar version. A
   * `dependsOn` builder is terminal — `.build()` pins against the derived latest shape.
   *
   * @example
   * createMigrations<InitialProgramBlueprintJSON>({ pseudoMigrateUntil: 3 })
   *   .dependsOn({ sessions: sessionBlueprintMigrations })
   *   .build<ProgramBlueprintJSON>();
   */
  dependsOn<const TDeps extends Record<string, AnyMigrator>>(
    dependents: TDeps,
  ): DependentsBuilder<DependentsLatest<TPrevOutput, TDeps>, DependentsAny<TPrevOutput, TDeps>, TAccumulated>;

  /**
   * Finalises the builder. Pass the hand-declared latest type as `TFinal` to *pin* the
   * chain: the call fails to compile unless the accumulated output is mutually assignable
   * to `TFinal`. This is how `latest/` stays the source of truth.
   */
  build<TFinal = TPrevOutput>(
    ...check: MutuallyAssignable<TPrevOutput, NoInfer<TFinal>> extends true
      ? []
      : [
          error: 'Final migration output does not match the declared latest type',
          expected: TFinal,
          received: TPrevOutput,
        ]
  ): Migrator<TFinal, TAccumulated[number]['$type'], TAccumulated>;
};

/**
 * Terminal builder returned by {@link MigrationsBuilder.dependsOn}. Only `.build()` remains;
 * it pins against the dependents-normalised latest shape and produces a migrator whose
 * accepted input (`$anyType`) is the any-stored-version shape.
 *
 * @typeParam TLatest      - The latest shape after dependents are brought to their own latest
 * @typeParam TAny         - The any-stored-version shape this migrator accepts
 * @typeParam TAccumulated - The numbered migrations (unchanged by dependsOn)
 */
type DependentsBuilder<TLatest, TAny, TAccumulated extends readonly [...AnyMigration[], AnyMigration]> = {
  build<TFinal>(
    ...check: MutuallyAssignable<TLatest & VersionOf<TFinal>, NoInfer<TFinal>> extends true
      ? []
      : [
          error: 'Final migration output does not match the declared latest type',
          expected: TFinal,
          received: TLatest & VersionOf<TFinal>,
        ]
  ): Migrator<TFinal, TAny, TAccumulated>;
};

class MigrationBuilderImpl<
  TPrevOutput,
  TAccumulated extends readonly [...AnyMigration[], AnyMigration],
> implements MigrationsBuilder<TPrevOutput, TAccumulated> {
  constructor(private previousValues: AnyMigration[]) {}

  add<TNext>(
    up: (state: TPrevOutput) => TNext & { version: TAccumulated['length'] },
  ): MigrationsBuilder<TNext, readonly [...TAccumulated, Migration<TPrevOutput, TNext>]> {
    const lastMigration = this.previousValues.at(-1);
    if (!lastMigration) {
      throw new Error('Bad migration');
    }
    return new MigrationBuilderImpl<TNext, readonly [...TAccumulated, Migration<TPrevOutput, TNext>]>([
      ...this.previousValues,
      { $type: undefined!, up },
    ]);
  }

  dependsOn<const TDeps extends Record<string, AnyMigrator>>(
    dependents: TDeps,
  ): DependentsBuilder<DependentsLatest<TPrevOutput, TDeps>, DependentsAny<TPrevOutput, TDeps>, TAccumulated> {
    return new DependentsBuilderImpl(this.previousValues, dependents);
  }

  build<TFinal = TPrevOutput>(
    ...check: MutuallyAssignable<TPrevOutput, NoInfer<TFinal>> extends true
      ? []
      : [
          error: 'Final migration output does not match the declared latest type',
          expected: TFinal,
          received: TPrevOutput,
        ]
  ): Migrator<TFinal, TAccumulated[number]['$type'], TAccumulated> {
    void check;
    return new MigratorImpl(this.previousValues, {}) as unknown as Migrator<
      TFinal,
      TAccumulated[number]['$type'],
      TAccumulated
    >;
  }
}

class DependentsBuilderImpl<
  TLatest,
  TAny,
  TAccumulated extends readonly [...AnyMigration[], AnyMigration],
> implements DependentsBuilder<TLatest, TAny, TAccumulated> {
  constructor(
    private previousValues: AnyMigration[],
    private dependents: Record<string, AnyMigrator>,
  ) {}

  build<TFinal>(
    ...check: MutuallyAssignable<TLatest & VersionOf<TFinal>, NoInfer<TFinal>> extends true
      ? []
      : [
          error: 'Final migration output does not match the declared latest type',
          expected: TFinal,
          received: TLatest & VersionOf<TFinal>,
        ]
  ): Migrator<TFinal, TAny, TAccumulated> {
    void check;
    return new MigratorImpl(this.previousValues, this.dependents) as unknown as Migrator<TFinal, TAny, TAccumulated>;
  }
}

class MigratorImpl<TFinal, TAny, TMigrations extends readonly [...AnyMigration[], AnyMigration]> implements Migrator<
  TFinal,
  TAny,
  TMigrations
> {
  $finalType: TFinal = undefined!;
  $anyType: TAny = undefined!;
  readonly latestVersion: number;

  constructor(
    private migrations: AnyMigration[],
    private dependents: Record<string, AnyMigrator>,
  ) {
    this.latestVersion = migrations.length;
  }

  migrate(value: TAny): TFinal {
    const migrated: any = this.migrateUntil(value as any, this.migrations.length as any);
    if (!this.hasDependents()) {
      return migrated as TFinal;
    }
    const result: any = { ...migrated };
    for (const [field, child] of Object.entries(this.dependents)) {
      const fieldValue = migrated[field];
      if (Array.isArray(fieldValue)) {
        result[field] = fieldValue.map((v) => child.migrate(v));
      } else if (fieldValue !== null && fieldValue !== undefined) {
        result[field] = child.migrate(fieldValue);
      }
    }
    return result as TFinal;
  }

  migrateUntil<TVersion extends TupleIndices<TMigrations>>(
    value: TMigrations[number]['$type'],
    maxVersion: TVersion,
  ): TMigrations[TVersion]['$type'] {
    const currentVersion = value.version ?? 0;
    if (currentVersion > this.latestVersion) {
      throw new Error(
        `Cannot migrate value at version ${currentVersion}: latest known version is ${this.latestVersion}`,
      );
    }
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

  private hasDependents(): boolean {
    for (const _ in this.dependents) {
      return true;
    }
    return false;
  }
}

/**
 * Applies a chain of ordered schema migrations to bring persisted data up to the latest
 * version (or any intermediate version), and brings embedded child models to their own
 * latest via {@link Migrator.dependsOn} declarations.
 *
 * Version numbers are 1-based and correspond to tuple positions:
 * - Index 0 → identity no-op (inserted by `createMigrations`)
 * - Index N → Nth `.add()` call → produces version N
 *
 * @typeParam TFinal      - The latest output type
 * @typeParam TAny        - The any-stored-version input type accepted by `migrate`
 * @typeParam TMigrations - The full readonly tuple of numbered migrations, for per-index lookups
 */
interface Migrator<TFinal, TAny, TMigrations extends readonly [...AnyMigration[], AnyMigration]> {
  /** Phantom — never set at runtime. Carries the latest type (`typeof migrator.$finalType`). */
  $finalType: TFinal;
  /** Phantom — never set at runtime. Carries the any-stored-version input type. */
  $anyType: TAny;

  /**
   * The highest version this model stamps on disk — its chain length, counting any
   * `pseudoMigrateUntil` seed steps. Used to reject values from a newer app version.
   */
  latestVersion: number;

  /** Migrates `value` to the latest version, bringing declared dependents to their latest. */
  migrate(value: TAny): TFinal;

  /**
   * Migrates `value` only up to (but not past) `maxVersion` of the numbered chain. Dependents
   * are *not* applied — this is an intermediate accessor over the numbered steps only.
   */
  migrateUntil<TVersion extends TupleIndices<TMigrations>>(
    value: TMigrations[number]['$type'],
    maxVersion: TVersion,
  ): TMigrations[TVersion]['$type'];
}

/**
 * Entry point for defining a versioned migration chain.
 *
 * Call `.add()` once per schema version bump, `.dependsOn({ field: childMigrator })` to
 * embed child models, and `.build()` to obtain a {@link Migrator}.
 *
 * @typeParam TInitial - The shape of version-1 data (the oldest persisted format)
 * @param opts.pseudoMigrateUntil - For a wrapper with no numbered steps of its own, seeds the
 *   chain with identity steps that stamp the top-level `version` up to this number, so existing
 *   rows (which already carry it) keep round-tripping. These come *before* any `.add()` steps
 *   and only set `version` — the final shape still emerges from the chain, never overridden.
 *
 * @example
 * const migrator = createMigrations<V1>().add(v1ToV2).add(v2ToV3).build();
 */
export function createMigrations<TInitial>(opts?: {
  pseudoMigrateUntil: number;
}): MigrationsBuilder<TInitial, [Migration<unknown, never>, Migration<unknown, TInitial>]> {
  const seed: AnyMigration[] = [{ $type: undefined!, up: (x) => x as TInitial }];
  for (let version = 2; version <= (opts?.pseudoMigrateUntil ?? 1); version++) {
    seed.push({ $type: undefined!, up: (x) => ({ ...x, version }) });
  }
  return new MigrationBuilderImpl(seed);
}
