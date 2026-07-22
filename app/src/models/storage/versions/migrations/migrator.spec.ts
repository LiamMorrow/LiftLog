import { describe, it, expect, expectTypeOf } from 'vitest';
import { createMigrations } from './migrator';

// ---------- test domain types ----------

type UserV1 = {
  version: 1;
  name: string;
};

type UserV2 = {
  version: 2;
  firstName: string;
  lastName: string;
};

type UserV3 = {
  version: 3;
  firstName: string;
  lastName: string;
  displayName: string;
};

// ---------- shared migrator ----------

const userMigrations = createMigrations<UserV1>()
  .add<UserV2>((v1) => {
    const [firstName = '', ...rest] = v1.name.split(' ');
    return { firstName, lastName: rest.join(' '), version: 2 };
  })
  .add((v2) => ({
    ...v2,
    displayName: `${v2.firstName} ${v2.lastName}`.trim(),
    version: 3 as const,
  }))
  .build();

// ---------- tests ----------
describe('migrator', () => {
  describe('migrate()', () => {
    it('migrates v1 all the way to v3', () => {
      const input: UserV1 = { version: 1, name: 'Ada Lovelace' };
      const result = userMigrations.migrate(input);
      expect(result).toEqual({
        version: 3,
        firstName: 'Ada',
        lastName: 'Lovelace',
        displayName: 'Ada Lovelace',
      });
    });

    it('migrates v2 to v3, skipping the v1→v2 migration', () => {
      const input: UserV2 = {
        version: 2,
        firstName: 'Grace',
        lastName: 'Hopper',
      };
      const result = userMigrations.migrate(input);
      expect(result).toEqual({
        version: 3,
        firstName: 'Grace',
        lastName: 'Hopper',
        displayName: 'Grace Hopper',
      });
    });

    it('returns a v3 value unchanged', () => {
      const input: UserV3 = {
        version: 3,
        firstName: 'Alan',
        lastName: 'Turing',
        displayName: 'Alan Turing',
      };
      const result = userMigrations.migrate(input);
      expect(result).toEqual(input);
    });

    it('attaches the correct version number after each migration step', () => {
      const input: UserV1 = { version: 1, name: 'Linus Torvalds' };
      const result = userMigrations.migrate(input);
      expect(result.version).toBe(3);
    });

    it('a name with no spaces produces an empty lastName', () => {
      const input: UserV1 = { version: 1, name: 'Cher' };
      const result = userMigrations.migrate(input);
      expect(result).toEqual({
        version: 3,
        firstName: 'Cher',
        lastName: '',
        displayName: 'Cher',
      });
    });

    it('does not mutate the input value', () => {
      const input: UserV1 = { version: 1, name: 'Ada Lovelace' };
      const frozen = Object.freeze(input);
      expect(() => userMigrations.migrate(frozen)).not.toThrow();
    });
  });

  describe('migrateUntil()', () => {
    it('stops at index 1, returning the v1 input unchanged', () => {
      const input: UserV1 = { version: 1, name: 'Margaret Hamilton' };
      // maxVersion === input.version, so the early-exit condition fires
      const result = userMigrations.migrateUntil(input, 1);
      expect(result).toEqual(input);
    });

    it('applies only the v1→v2 migration when stopping at index 2', () => {
      const input: UserV1 = { version: 1, name: 'Margaret Hamilton' };
      const result: UserV2 = userMigrations.migrateUntil(input, 2);
      expect(result).toEqual({
        version: 2,
        firstName: 'Margaret',
        lastName: 'Hamilton',
      });
    });

    it('applies all migrations when maxVersion equals the chain length', () => {
      const input: UserV1 = { version: 1, name: 'Ada Lovelace' };
      const result: UserV3 = userMigrations.migrateUntil(input, 3);
      expect(result).toEqual({
        version: 3,
        firstName: 'Ada',
        lastName: 'Lovelace',
        displayName: 'Ada Lovelace',
      });
    });

    it('returns a mid-chain value unchanged when it is already at maxVersion', () => {
      // v2 input, stop at 2 — no migration should run
      const input: UserV2 = {
        version: 2,
        firstName: 'Grace',
        lastName: 'Hopper',
      };
      const result: UserV2 = userMigrations.migrateUntil(input, 2);
      expect(result).toEqual(input);
    });

    it('returns a value unchanged when its version already exceeds maxVersion', () => {
      // v3 input, stop at 2 — version >= maxVersion so early-exit fires immediately
      const input: UserV3 = {
        version: 3,
        firstName: 'Alan',
        lastName: 'Turing',
        displayName: 'Alan Turing',
      };
      const result = userMigrations.migrateUntil(input, 2);
      expect(result).toEqual(input);
    });

    it('stops at index 0, returning the input unchanged', () => {
      // version (1) >= maxVersion (0), so the early-exit fires before any migration runs
      const input: UserV1 = { version: 1, name: 'Dennis Ritchie' };
      const result: never = userMigrations.migrateUntil(input, 0);
      expect(result).toEqual(input);
    });
  });

  it('does not accept a value whose shape is not in the migrations union', () => {
    // @ts-expect-error -- shape not in the union; Runtime error because it tries to access name fields
    expect(() => userMigrations.migrate({ foo: 'bar' })).toThrow();
  });

  describe('createMigrations() with a single .add()', () => {
    type ThingV1 = { version: 1; value: number };
    type ThingV2 = { version: 2; doubled: number };

    const thingMigrations = createMigrations<ThingV1>()
      .add<ThingV2>((v1) => ({ doubled: v1.value * 2, version: 2 }))
      .build();

    it('applies the single migration', () => {
      const result = thingMigrations.migrate({ version: 1, value: 21 });
      expect(result).toEqual({ version: 2, doubled: 42 });
    });

    it('skips when already at the target version', () => {
      const input: ThingV2 = { version: 2, doubled: 100 };
      expect(thingMigrations.migrate(input)).toEqual(input);
    });
  });

  describe('implicit typing', () => {
    it('can define a migration with implicit typing', () => {
      type InitialType = { foo: 'foo' };
      const migrations = createMigrations<InitialType>()
        .add(() => ({
          version: 2,
          bar: 'bar',
        }))
        .add(() => ({ version: 3, baz: 'baz' }))
        .build();

      // Allows all these types
      const foo: typeof migrations.$anyType = { foo: 'foo' };
      const bar: typeof migrations.$anyType = { bar: 'bar', version: 2 };
      const baz: typeof migrations.$anyType = { baz: 'baz', version: 3 };

      // Allows the final type
      const bazFinal: typeof migrations.$finalType = { baz: 'baz', version: 3 };

      // Does not allow an arbitrary type
      // @ts-expect-error Bean is not one of the valid migration types
      const disallowedAny: typeof migrations.$anyType = { bean: 'bean' };
      // @ts-expect-error is not the final migration types, even if it is one of the any
      const disallowedFinal: typeof migrations.$finalType = { foo: 'foo' };

      expect(migrations.migrate(foo)).toEqual({ version: 3, baz: 'baz' });
      expect(migrations.migrate(bar)).toEqual({ version: 3, baz: 'baz' });
      expect(migrations.migrate(baz)).toEqual({ version: 3, baz: 'baz' });
      expect(migrations.migrate(bazFinal)).toEqual({ version: 3, baz: 'baz' });

      // It does not actually throw, since the migration doesn't care about inputs and doesn't validate schema at runtime
      expect(migrations.migrate(disallowedAny)).toEqual({
        version: 3,
        baz: 'baz',
      });
      expect(migrations.migrate(disallowedFinal)).toEqual({
        version: 3,
        baz: 'baz',
      });
    });
  });

  describe('dependsOn()', () => {
    // ---- leaf children (real numbered chains, first-class versions) ----
    type WidgetV1 = { size: number };
    type WidgetV2 = { version: 2; size: number; color: string };
    type WidgetV3 = { version: 3; size: number; color: string; label: string };

    const widgetMigrations = createMigrations<WidgetV1>()
      .add<WidgetV2>((v1) => ({ version: 2, size: v1.size, color: 'red' }))
      .add<WidgetV3>((v2) => ({ version: 3, size: v2.size, color: v2.color, label: '' }))
      .build();

    type SprocketV1 = { teeth: number };
    type SprocketV2 = { version: 2; teeth: number; pitch: number };

    const sprocketMigrations = createMigrations<SprocketV1>()
      .add<SprocketV2>((v1) => ({ version: 2, teeth: v1.teeth, pitch: 1 }))
      .build();

    // ---- wrappers (no numbered steps of their own; children via dependsOn) ----
    type GadgetInit = { name: string; widget: WidgetV1 };
    type GadgetLatest = { version: 3; name: string; widget: WidgetV3 };

    const gadgetMigrations = createMigrations<GadgetInit>({ pseudoMigrateUntil: 3 })
      .dependsOn({ widget: widgetMigrations })
      .build<GadgetLatest>();

    type ToolboxInit = { widgets: WidgetV1[] };
    type ToolboxLatest = { version: 3; widgets: WidgetV3[] };

    const toolboxMigrations = createMigrations<ToolboxInit>({ pseudoMigrateUntil: 3 })
      .dependsOn({ widgets: widgetMigrations })
      .build<ToolboxLatest>();

    type KitInit = { primary: WidgetV1 | undefined };
    type KitLatest = { version: 3; primary: WidgetV3 | undefined };

    const kitMigrations = createMigrations<KitInit>({ pseudoMigrateUntil: 3 })
      .dependsOn({ primary: widgetMigrations })
      .build<KitLatest>();

    // wrapper embedding another wrapper — recursion must reach the leaf
    type CrateInit = { gadget: GadgetInit };
    type CrateLatest = { version: 3; gadget: GadgetLatest };

    const crateMigrations = createMigrations<CrateInit>({ pseudoMigrateUntil: 3 })
      .dependsOn({ gadget: gadgetMigrations })
      .build<CrateLatest>();

    // wrapper with two independent leaf children — the case a scalar/max version can't model
    type ComboInit = { widget: WidgetV1; sprocket: SprocketV1 };
    type ComboLatest = { version: 3; widget: WidgetV3; sprocket: SprocketV2 };

    const comboMigrations = createMigrations<ComboInit>({ pseudoMigrateUntil: 3 })
      .dependsOn({ widget: widgetMigrations, sprocket: sprocketMigrations })
      .build<ComboLatest>();

    const latestWidget: WidgetV3 = { version: 3, size: 1, color: 'red', label: '' };

    describe('migrate()', () => {
      it('brings a single embedded child to its latest and stamps the pseudo version', () => {
        const result = gadgetMigrations.migrate({ name: 'g', widget: { size: 5 } });
        expect(result).toEqual({
          version: 3,
          name: 'g',
          widget: { version: 3, size: 5, color: 'red', label: '' },
        });
      });

      it('migrates each child in an embedded array', () => {
        const result = toolboxMigrations.migrate({ widgets: [{ size: 1 }, { version: 2, size: 2, color: 'blue' }] });
        expect(result).toEqual({
          version: 3,
          widgets: [
            { version: 3, size: 1, color: 'red', label: '' },
            { version: 3, size: 2, color: 'blue', label: '' },
          ],
        });
      });

      it('leaves an absent optional child untouched', () => {
        const result = kitMigrations.migrate({ primary: undefined });
        expect(result).toEqual({ version: 3, primary: undefined });
      });

      it('migrates a present optional child', () => {
        const result = kitMigrations.migrate({ primary: { size: 9 } });
        expect(result).toEqual({ version: 3, primary: { version: 3, size: 9, color: 'red', label: '' } });
      });

      it('migrates two independent embedded children on their own chains', () => {
        const result = comboMigrations.migrate({ widget: { size: 2 }, sprocket: { teeth: 8 } });
        expect(result).toEqual({
          version: 3,
          widget: { version: 3, size: 2, color: 'red', label: '' },
          sprocket: { version: 2, teeth: 8, pitch: 1 },
        });
      });

      it('recurses through nested wrappers down to the leaf', () => {
        const result = crateMigrations.migrate({ gadget: { name: 'g', widget: { size: 3 } } });
        expect(result).toEqual({
          version: 3,
          gadget: { version: 3, name: 'g', widget: { version: 3, size: 3, color: 'red', label: '' } },
        });
      });

      it('is idempotent on an already-latest value', () => {
        const once = gadgetMigrations.migrate({ name: 'g', widget: { size: 5 } });
        expect(gadgetMigrations.migrate(once)).toEqual(once);
      });

      it('does not mutate the input value', () => {
        const input = { name: 'g', widget: { size: 5 } };
        gadgetMigrations.migrate(input);
        expect(input).toEqual({ name: 'g', widget: { size: 5 } });
      });

      it('rejects a wrapper value from a newer app version', () => {
        expect(() => gadgetMigrations.migrate({ version: 4, name: 'g', widget: latestWidget } as never)).toThrow();
      });
    });

    describe('typing', () => {
      it('exposes the latest type as $finalType and accepts any stored version as $anyType', () => {
        const latest: typeof gadgetMigrations.$finalType = { version: 3, name: 'g', widget: latestWidget };
        const oldest: typeof gadgetMigrations.$anyType = { name: 'g', widget: { size: 1 } };
        const midChildOldWrapper: typeof gadgetMigrations.$anyType = {
          name: 'g',
          widget: { version: 2, size: 1, color: 'red' },
        };

        expect(gadgetMigrations.migrate(latest)).toEqual(latest);
        expect(gadgetMigrations.migrate(oldest).version).toBe(3);
        expect(gadgetMigrations.migrate(midChildOldWrapper).widget.version).toBe(3);
      });

      // The type-only `expectTypeOf<T>()` form is used so nothing dereferences the phantom
      // `$finalType`/`$anyType` at runtime. These are checked by `tsc`/`tsgo` at typecheck time;
      // a regression in the array-vs-single-vs-optional derivation is a compile error.
      it('derives an array field as an array of the child type', () => {
        expectTypeOf<(typeof toolboxMigrations.$finalType)['widgets']>().toEqualTypeOf<WidgetV3[]>();
        expectTypeOf<(typeof toolboxMigrations.$anyType)['widgets']>().toEqualTypeOf<
          (typeof widgetMigrations.$anyType)[]
        >();
        // an array field must not collapse to a single child
        expectTypeOf<(typeof toolboxMigrations.$finalType)['widgets']>().not.toEqualTypeOf<WidgetV3>();
      });

      it('derives a single field as the bare child type', () => {
        expectTypeOf<(typeof gadgetMigrations.$finalType)['widget']>().toEqualTypeOf<WidgetV3>();
        expectTypeOf<(typeof gadgetMigrations.$anyType)['widget']>().toEqualTypeOf<typeof widgetMigrations.$anyType>();
        // a single field must not become an array
        expectTypeOf<(typeof gadgetMigrations.$finalType)['widget']>().not.toEqualTypeOf<WidgetV3[]>();
      });

      it('preserves the optional/undefined union on an optional field', () => {
        expectTypeOf<(typeof kitMigrations.$finalType)['primary']>().toEqualTypeOf<WidgetV3 | undefined>();
        expectTypeOf<(typeof kitMigrations.$anyType)['primary']>().toEqualTypeOf<
          typeof widgetMigrations.$anyType | undefined
        >();
      });
    });
  });

  describe('version stamping', () => {
    it('each migration step stamps the correct incremented version', () => {
      type A = { version: 1; x: string };
      type B = { version: 2; y: string };
      type C = { version: 3; z: string };
      type D = { version: 4; w: string };

      const m = createMigrations<A>()
        .add<B>((a) => ({ y: a.x + '-b', version: 2 }))
        .add<C>((b) => ({ z: b.y + '-c', version: 3 }))
        .add<D>((c) => ({ w: c.z + '-d', version: 4 }))
        .build();

      expect(m.migrate({ version: 1, x: 'start' })).toEqual({
        version: 4,
        w: 'start-b-c-d',
      });
    });

    it('intermediate steps carry the correct version as input to subsequent migrations', () => {
      // Verifies that the version stamped by step N is visible to step N+1's up function,
      // not just that the final output has the right version.
      const seenVersions: number[] = [];

      type A = { version: 1; x: number };
      type B = { version: 2; x: number };
      type C = { version: 3; x: number };

      const m = createMigrations<A>()
        .add<B>((a) => {
          seenVersions.push(a.version);
          return { x: a.x, version: 2 };
        })
        .add<C>((b) => {
          seenVersions.push(b.version);
          return { x: b.x, version: 3 };
        })
        .build();

      m.migrate({ version: 1, x: 0 });
      expect(seenVersions).toEqual([1, 2]);
    });
  });
});
