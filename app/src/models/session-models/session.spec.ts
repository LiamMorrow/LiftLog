import { describe, it, expect, beforeEach } from 'vitest';
import { Duration, LocalDate, OffsetDateTime, ZoneOffset } from '@js-joda/core';
import BigNumber from 'bignumber.js';
import { v4 as uuid } from 'uuid';
import {
  WeightedExerciseBlueprint,
  Rest,
  SessionBlueprint,
  CardioExerciseBlueprint,
  IncreaseAllEvenlyProgressiveOverload,
} from '@/models/blueprint-models';
import { Weight } from '@/models/weight';
import { Session } from '@/models/session-models/session';
import { RecordedCardioExercise } from '@/models/session-models/recorded-cardio-exercise';
import {
  PotentialSet,
  RecordedSet,
  RecordedWeightedExercise,
} from '@/models/session-models/recorded-weighted-exercise';
import {
  tick,
  tickAt,
  makeWeightedBlueprint,
  makeCardioBlueprint,
  makeCardioSetBlueprint,
  makeSession,
  filledPotentialSet,
  createExerciseBlueprint,
  createSessionBlueprint,
  createSession,
} from './__test__/helpers';

describe('Session supersets', () => {
  let session: Session;

  describe('When given a session with supersets', () => {
    beforeEach(() => {
      session = createSession(
        createSessionBlueprint([
          createExerciseBlueprint(0, false), // Exercise 0: not supersetting
          createExerciseBlueprint(1, true), // Exercise 1: supersets with next
          createExerciseBlueprint(2, false), // Exercise 2: not supersetting
          createExerciseBlueprint(3, true), // Exercise 3: supersets with next
          createExerciseBlueprint(4, true), // Exercise 4: supersets with next
          createExerciseBlueprint(5, false), // Exercise 5: not supersetting
        ]),
        [], // fillSets - no sets completed initially
      );
    });

    it('should have exercise 0 set as the next exercise', () => {
      const nextExercise = session.nextExercise;
      expect(nextExercise).not.toBeNull();
      expect(nextExercise?.blueprint.name).toBe(
        session.recordedExercises[0]!.blueprint.name,
      );
    });

    describe('and the last completed set was exercise 0 (not a superset)', () => {
      beforeEach(() => {
        session = session.withCycledExerciseReps(0, 0, tick());
      });

      it('should have the next set be the first exercise', () => {
        const nextExercise = session.nextExercise;
        expect(nextExercise).not.toBeNull();
        expect(nextExercise?.blueprint.name).toBe(
          session.recordedExercises[0]!.blueprint.name,
        );
      });
    });

    describe('and the last completed set was exercise 1 (a superset with exercise 2)', () => {
      beforeEach(() => {
        session = session.withCycledExerciseReps(1, 0, tick());
      });

      it('should have the next set be 2', () => {
        const nextExercise = session.nextExercise;
        expect(nextExercise).not.toBeNull();
        expect(nextExercise?.blueprint.name).toBe(
          session.recordedExercises[2]!.blueprint.name,
        );
      });
    });

    describe('and the last completed set was exercise 2 (a superset with the previous exercise (1))', () => {
      beforeEach(() => {
        session = session.withCycledExerciseReps(2, 0, tick());
      });

      it('should have the next set be 1', () => {
        const nextExercise = session.nextExercise;
        expect(nextExercise).not.toBeNull();
        expect(nextExercise?.blueprint.name).toBe(
          session.recordedExercises[1]!.blueprint.name,
        );
      });
    });

    describe('and the last completed set was exercise 3 (a superset with 4 and 5)', () => {
      beforeEach(() => {
        session = session.withCycledExerciseReps(3, 0, tick());
      });

      it('should have the next set be 4', () => {
        const nextExercise = session.nextExercise;
        expect(nextExercise).not.toBeNull();
        expect(nextExercise?.blueprint.name).toBe(
          session.recordedExercises[4]!.blueprint.name,
        );
      });
    });

    describe('and the last completed set was exercise 4 (a superset with 3 and 5)', () => {
      beforeEach(() => {
        session = session.withCycledExerciseReps(4, 0, tick());
      });

      it('should have the next set be 5', () => {
        const nextExercise = session.nextExercise;
        expect(nextExercise).not.toBeNull();
        expect(nextExercise?.blueprint.name).toBe(
          session.recordedExercises[5]!.blueprint.name,
        );
      });
    });

    describe('and the last completed set was exercise 5 (a superset with 3 and 4)', () => {
      beforeEach(() => {
        session = session.withCycledExerciseReps(5, 0, tick());
      });

      it('should cycle back to exercise 3', () => {
        const nextExercise = session.nextExercise;
        expect(nextExercise).not.toBeNull();
        expect(nextExercise?.blueprint.name).toBe(
          session.recordedExercises[3]!.blueprint.name,
        );
      });
    });
  });

  describe('When the first exercise is a superset', () => {
    beforeEach(() => {
      session = createSession(
        createSessionBlueprint([
          createExerciseBlueprint(0, true), // Exercise 0: supersets with next
          createExerciseBlueprint(1, false), // Exercise 1: not supersetting
          createExerciseBlueprint(2, false), // Exercise 2: not supersetting
        ]),
        [], // fillSets - no sets completed initially
      );
    });

    it('should have exercise 0 set as the next exercise', () => {
      const nextExercise = session.nextExercise;
      expect(nextExercise).not.toBeNull();
      expect(nextExercise?.blueprint.name).toBe(
        session.recordedExercises[0]!.blueprint.name,
      );
    });

    describe('and the last completed set was exercise 0 (a superset with exercise 1)', () => {
      beforeEach(() => {
        session = session.withCycledExerciseReps(0, 0, tick());
      });

      it('should have the next set be 1', () => {
        const nextExercise = session.nextExercise;
        expect(nextExercise).not.toBeNull();
        expect(nextExercise?.blueprint.name).toBe(
          session.recordedExercises[1]!.blueprint.name,
        );
      });
    });

    describe('and the last completed set was exercise 1 (supersetting with 0)', () => {
      beforeEach(() => {
        session = session.withCycledExerciseReps(1, 0, tick());
      });

      it('should have the next set be 0', () => {
        const nextExercise = session.nextExercise;
        expect(nextExercise).not.toBeNull();
        expect(nextExercise?.blueprint.name).toBe(
          session.recordedExercises[0]!.blueprint.name,
        );
      });
    });
  });

  describe('When the last exercise is a superset', () => {
    beforeEach(() => {
      session = createSession(
        createSessionBlueprint([
          createExerciseBlueprint(0, false), // Exercise 0: not supersetting
          createExerciseBlueprint(1, false), // Exercise 1: not supersetting
          createExerciseBlueprint(2, true), // Exercise 2: supersets with next (but it's last)
        ]),
        [], // fillSets - no sets completed initially
      );
    });

    it('should have exercise 0 set as the next exercise', () => {
      const nextExercise = session.nextExercise;
      expect(nextExercise).not.toBeNull();
      expect(nextExercise?.blueprint.name).toBe(
        session.recordedExercises[0]!.blueprint.name,
      );
    });

    describe('and the last completed set was exercise 0 (not a superset)', () => {
      beforeEach(() => {
        session = session.withCycledExerciseReps(0, 0, tick());
      });

      it('should have the next set be itself (0)', () => {
        const nextExercise = session.nextExercise;
        expect(nextExercise).not.toBeNull();
        expect(nextExercise?.blueprint.name).toBe(
          session.recordedExercises[0]!.blueprint.name,
        );
      });
    });

    describe('and the last completed set was exercise 1 (not a superset)', () => {
      beforeEach(() => {
        session = session.withCycledExerciseReps(1, 0, tick());
      });

      it('should have the next set be itself (1)', () => {
        const nextExercise = session.nextExercise;
        expect(nextExercise).not.toBeNull();
        expect(nextExercise?.blueprint.name).toBe(
          session.recordedExercises[1]!.blueprint.name,
        );
      });
    });

    describe('and the last completed set was exercise 2 (a superset with next, but it is the last - so noop)', () => {
      beforeEach(() => {
        session = session.withCycledExerciseReps(2, 0, tick());
      });

      it('should have the next set be itself (2)', () => {
        const nextExercise = session.nextExercise;
        expect(nextExercise).not.toBeNull();
        expect(nextExercise?.blueprint.name).toBe(
          session.recordedExercises[2]!.blueprint.name,
        );
      });
    });
  });

  describe('When the last exercise is a completed superset', () => {
    beforeEach(() => {
      session = createSession(
        createSessionBlueprint([
          createExerciseBlueprint(0, false), // Exercise 0: not supersetting
          createExerciseBlueprint(1, true), // Exercise 1: supersets with next
          createExerciseBlueprint(2, false), // Exercise 2: not supersetting
        ]),
        [0, 1, 2], // fillSets - all exercises completed
      );
    });

    it('should end the session', () => {
      const nextExercise = session.nextExercise;
      expect(nextExercise).toBeUndefined();
    });
  });
});

// ─── withUpdatedDate ──────────────────────────────────────────────────────────

describe('Session.withUpdatedDate', () => {
  it('moves all set completion datetimes when all sets share the same date (absolute mode)', () => {
    const bp = makeWeightedBlueprint();
    const sessionDate = LocalDate.of(2025, 4, 5);
    const t1 = tickAt(10, 0);
    const t2 = tickAt(10, 5);

    const exercise = new RecordedWeightedExercise(
      bp,
      [
        filledPotentialSet(10, t1),
        filledPotentialSet(10, t2),
        new PotentialSet(undefined, new Weight(100, 'kilograms')),
      ],
      undefined,
    );

    const session = new Session(
      uuid(),
      new SessionBlueprint('Test', [bp], ''),
      [exercise],
      sessionDate,
      undefined,
      undefined,
    );

    const newDate = LocalDate.of(2025, 4, 10);
    const updated = session.withUpdatedDate(newDate);
    const updatedExercise = updated
      .recordedExercises[0]! as RecordedWeightedExercise;

    // All completed sets should land on the new date
    const completedSets = updatedExercise.potentialSets.filter((s) => s.set);
    expect(
      completedSets.every((s) =>
        s.set!.completionDateTime.toLocalDate().equals(newDate),
      ),
    ).toBe(true);

    // Times of day preserved
    expect(
      updatedExercise.potentialSets[0]!.set!.completionDateTime.toLocalTime(),
    ).toEqual(t1.toLocalTime());
    expect(
      updatedExercise.potentialSets[1]!.set!.completionDateTime.toLocalTime(),
    ).toEqual(t2.toLocalTime());
  });

  it('maintains relative day offsets when sets cross midnight', () => {
    const bp = makeWeightedBlueprint();
    const sessionDate = LocalDate.of(2025, 4, 5);

    // One set before midnight, one after → two different dates
    const beforeMidnight = OffsetDateTime.of(
      2025,
      4,
      5,
      23,
      55,
      0,
      0,
      ZoneOffset.UTC,
    );
    const afterMidnight = OffsetDateTime.of(
      2025,
      4,
      6,
      0,
      5,
      0,
      0,
      ZoneOffset.UTC,
    );

    const exercise = new RecordedWeightedExercise(
      bp,
      [
        filledPotentialSet(10, beforeMidnight),
        filledPotentialSet(10, afterMidnight),
        new PotentialSet(undefined, new Weight(100, 'kilograms')),
      ],
      undefined,
    );

    const session = new Session(
      uuid(),
      new SessionBlueprint('Test', [bp], ''),
      [exercise],
      sessionDate,
      undefined,
      undefined,
    );

    const newDate = LocalDate.of(2025, 4, 12);
    const updated = session.withUpdatedDate(newDate);
    const sets = (updated.recordedExercises[0]! as RecordedWeightedExercise)
      .potentialSets;

    const d0 = sets[0]!.set!.completionDateTime.toLocalDate();
    const d1 = sets[1]!.set!.completionDateTime.toLocalDate();

    expect(d0.equals(newDate)).toBe(true);
    expect(d1.equals(newDate.plusDays(1))).toBe(true);
  });

  it('updates the session date itself', () => {
    const session = makeSession([makeWeightedBlueprint()]);
    const newDate = LocalDate.of(2025, 6, 1);
    expect(session.withUpdatedDate(newDate).date.equals(newDate)).toBe(true);
  });

  it('is a no-op on sets without completionDateTime', () => {
    const session = makeSession([makeWeightedBlueprint()]);
    const newDate = LocalDate.of(2025, 6, 1);
    const updated = session.withUpdatedDate(newDate);
    const sets = (updated.recordedExercises[0]! as RecordedWeightedExercise)
      .potentialSets;
    expect(sets.every((s) => s.set === undefined)).toBe(true);
  });
});

// ─── withCycledExerciseReps ───────────────────────────────────────────────────

describe('Session.withCycledExerciseReps', () => {
  function sessionWithOneExercise() {
    const bp = makeWeightedBlueprint();
    return makeSession([bp]);
  }

  it('first cycle sets reps to blueprint repsPerSet', () => {
    const session = sessionWithOneExercise();
    const t = tick();
    const updated = session.withCycledExerciseReps(0, 0, t);
    const set = (updated.recordedExercises[0]! as RecordedWeightedExercise)
      .potentialSets[0]!.set;
    expect(set).toBeDefined();
    expect(set!.repsCompleted).toBe(10); // repsPerSet from makeWeightedBlueprint
  });

  it('second cycle decrements reps by 1', () => {
    const session = sessionWithOneExercise();
    const t = tick();
    const after1 = session.withCycledExerciseReps(0, 0, t);
    const after2 = after1.withCycledExerciseReps(0, 0, tick());
    const set = (after2.recordedExercises[0]! as RecordedWeightedExercise)
      .potentialSets[0]!.set;
    expect(set!.repsCompleted).toBe(9);
  });

  it('cycling at 0 reps clears the set', () => {
    const bp = makeWeightedBlueprint();
    const t = tick();
    const exercise = new RecordedWeightedExercise(
      bp,
      [
        new PotentialSet(new RecordedSet(0, t), new Weight(100, 'kilograms')),
        new PotentialSet(undefined, new Weight(100, 'kilograms')),
        new PotentialSet(undefined, new Weight(100, 'kilograms')),
      ],
      undefined,
    );
    const session = new Session(
      uuid(),
      new SessionBlueprint('Test', [bp], ''),
      [exercise],
      LocalDate.of(2025, 4, 5),
      undefined,
      undefined,
    );

    const updated = session.withCycledExerciseReps(0, 0, tick());
    const set = (updated.recordedExercises[0]! as RecordedWeightedExercise)
      .potentialSets[0]!.set;
    expect(set).toBeUndefined();
  });

  it('sets session date to the time date if session not yet started', () => {
    const session = sessionWithOneExercise();
    const futureTime = OffsetDateTime.of(
      2025,
      6,
      15,
      12,
      0,
      0,
      0,
      ZoneOffset.UTC,
    );
    const updated = session.withCycledExerciseReps(0, 0, futureTime);
    expect(updated.date.equals(LocalDate.of(2025, 6, 15))).toBe(true);
  });

  it('does not change session date if already started', () => {
    const session = sessionWithOneExercise();
    const t1 = OffsetDateTime.of(2025, 4, 5, 10, 0, 0, 0, ZoneOffset.UTC);
    const t2 = OffsetDateTime.of(2025, 6, 15, 12, 0, 0, 0, ZoneOffset.UTC);
    const after1 = session.withCycledExerciseReps(0, 0, t1);
    const after2 = after1.withCycledExerciseReps(0, 1, t2);
    expect(after2.date.equals(LocalDate.of(2025, 4, 5))).toBe(true);
  });

  it('is a no-op on a cardio exercise index', () => {
    const cardioBp = makeCardioBlueprint();
    const session = makeSession([cardioBp]);
    const updated = session.withCycledExerciseReps(0, 0, tick());
    // Should return same session unchanged
    expect(updated.recordedExercises[0]!).toBe(session.recordedExercises[0]!);
  });
});

// ─── withAddedExercise ────────────────────────────────────────────────────────

describe('Session.withAddedExercise', () => {
  it('appends the exercise to both recordedExercises and blueprint', () => {
    const session = makeSession([makeWeightedBlueprint('Squat')]);
    const newBp = makeWeightedBlueprint('Bench');
    const updated = session.withAddedExercise(newBp, false);

    expect(updated.recordedExercises).toHaveLength(2);
    expect(updated.blueprint.exercises).toHaveLength(2);
    expect(updated.recordedExercises[1]!.blueprint.name).toBe('Bench');
  });

  it('uses kilograms when useImperialUnits is false', () => {
    const session = makeSession([]);
    const updated = session.withAddedExercise(makeWeightedBlueprint(), false);
    const sets = (updated.recordedExercises[0]! as RecordedWeightedExercise)
      .potentialSets;
    expect(sets.every((s) => s.weight.unit === 'kilograms')).toBe(true);
  });

  it('uses pounds when useImperialUnits is true', () => {
    const session = makeSession([]);
    const updated = session.withAddedExercise(makeWeightedBlueprint(), true);
    const sets = (updated.recordedExercises[0]! as RecordedWeightedExercise)
      .potentialSets;
    expect(sets.every((s) => s.weight.unit === 'pounds')).toBe(true);
  });

  it('does not mutate the original session', () => {
    const session = makeSession([makeWeightedBlueprint()]);
    session.withAddedExercise(makeWeightedBlueprint('Bench'), false);
    expect(session.recordedExercises).toHaveLength(1);
  });
});

// ─── withEditedExercise ───────────────────────────────────────────────────────

describe('Session.withEditedExercise', () => {
  describe('type change: weighted → cardio', () => {
    it('replaces the recorded exercise with an empty cardio exercise', () => {
      const weightedBp = makeWeightedBlueprint();
      const session = makeSession([weightedBp]);
      const cardioBp = makeCardioBlueprint(2);

      const updated = session.withEditedExercise(0, cardioBp, false);

      expect(updated.recordedExercises[0]!.type).toBe('RecordedCardioExercise');
      expect(updated.recordedExercises[0]!.blueprint.name).toBe('Row');
    });

    it('uses kilograms on type change when useImperialUnits is false', () => {
      const session = makeSession([makeCardioBlueprint()]);
      const weightedBp = makeWeightedBlueprint();
      const updated = session.withEditedExercise(0, weightedBp, false);
      const sets = (updated.recordedExercises[0]! as RecordedWeightedExercise)
        .potentialSets;
      expect(sets.every((s) => s.weight.unit === 'kilograms')).toBe(true);
    });

    it('uses pounds on type change when useImperialUnits is true', () => {
      const session = makeSession([makeCardioBlueprint()]);
      const weightedBp = makeWeightedBlueprint();
      const updated = session.withEditedExercise(0, weightedBp, true);
      const sets = (updated.recordedExercises[0]! as RecordedWeightedExercise)
        .potentialSets;
      expect(sets.every((s) => s.weight.unit === 'pounds')).toBe(true);
    });

    it('discards existing weighted set data on type change', () => {
      const bp = makeWeightedBlueprint();
      const t = tick();
      const exercise = new RecordedWeightedExercise(
        bp,
        [
          filledPotentialSet(10, t),
          filledPotentialSet(8, t.plusSeconds(30)),
          new PotentialSet(undefined, new Weight(100, 'kilograms')),
        ],
        undefined,
      );
      const session = new Session(
        uuid(),
        new SessionBlueprint('Test', [bp], ''),
        [exercise],
        LocalDate.of(2025, 4, 5),
        undefined,
        undefined,
      );

      const updated = session.withEditedExercise(
        0,
        makeCardioBlueprint(),
        false,
      );
      const cardio = updated.recordedExercises[0]! as RecordedCardioExercise;
      expect(cardio.sets.every((s) => s.completionDateTime === undefined)).toBe(
        true,
      );
    });
  });

  describe('same type: weighted → weighted', () => {
    it('updates the blueprint without touching existing set data', () => {
      const bp = makeWeightedBlueprint('Squat');
      const t = tick();
      const exercise = new RecordedWeightedExercise(
        bp,
        [
          filledPotentialSet(10, t),
          filledPotentialSet(9, t.plusSeconds(60)),
          new PotentialSet(undefined, new Weight(100, 'kilograms')),
        ],
        undefined,
      );
      const session = new Session(
        uuid(),
        new SessionBlueprint('Test', [bp], ''),
        [exercise],
        LocalDate.of(2025, 4, 5),
        undefined,
        undefined,
      );

      const editedBp = makeWeightedBlueprint('Squat (edited)'); // same set count (3)
      const updated = session.withEditedExercise(0, editedBp, false);
      const updatedExercise = updated
        .recordedExercises[0]! as RecordedWeightedExercise;

      expect(updatedExercise.blueprint.name).toBe('Squat (edited)');
      expect(updatedExercise.potentialSets[0]!.set?.repsCompleted).toBe(10);
      expect(updatedExercise.potentialSets[1]!.set?.repsCompleted).toBe(9);
    });

    it('truncates potentialSets when set count decreases', () => {
      const bp = makeWeightedBlueprint('Squat'); // 3 sets
      const t = tick();
      const exercise = new RecordedWeightedExercise(
        bp,
        [
          filledPotentialSet(10, t),
          filledPotentialSet(9, t.plusSeconds(60)),
          filledPotentialSet(8, t.plusSeconds(120)),
        ],
        undefined,
      );
      const session = new Session(
        uuid(),
        new SessionBlueprint('Test', [bp], ''),
        [exercise],
        LocalDate.of(2025, 4, 5),
        undefined,
        undefined,
      );

      const fewerSetsBp = new WeightedExerciseBlueprint(
        'Squat',
        2,
        10,
        new IncreaseAllEvenlyProgressiveOverload(BigNumber(2.5)),
        Rest.medium,
        false,
        '',
        '',
      );
      const updated = session.withEditedExercise(0, fewerSetsBp, false);
      expect(
        (updated.recordedExercises[0]! as RecordedWeightedExercise)
          .potentialSets,
      ).toHaveLength(2);
    });

    it('fills new slots with maxWeight when set count increases', () => {
      const bp = new WeightedExerciseBlueprint(
        'Squat',
        2,
        10,
        new IncreaseAllEvenlyProgressiveOverload(BigNumber(2.5)),
        Rest.medium,
        false,
        '',
        '',
      );
      const heavyWeight = new Weight(140, 'kilograms');
      const exercise = new RecordedWeightedExercise(
        bp,
        [
          new PotentialSet(undefined, heavyWeight),
          new PotentialSet(undefined, new Weight(100, 'kilograms')),
        ],
        undefined,
      );
      const session = new Session(
        uuid(),
        new SessionBlueprint('Test', [bp], ''),
        [exercise],
        LocalDate.of(2025, 4, 5),
        undefined,
        undefined,
      );

      const moreSets = new WeightedExerciseBlueprint(
        'Squat',
        4,
        10,
        new IncreaseAllEvenlyProgressiveOverload(BigNumber(2.5)),
        Rest.medium,
        false,
        '',
        '',
      );
      const updated = session.withEditedExercise(0, moreSets, false);
      const sets = (updated.recordedExercises[0]! as RecordedWeightedExercise)
        .potentialSets;

      expect(sets).toHaveLength(4);
      // New slots should be seeded with maxWeight
      expect(sets[2]!.weight).toEqual(heavyWeight);
      expect(sets[3]!.weight).toEqual(heavyWeight);
      // New slots should be uncompleted
      expect(sets[2]!.set).toBeUndefined();
      expect(sets[3]!.set).toBeUndefined();
    });
  });

  describe('same type: cardio → cardio', () => {
    it('remaps existing set data to the new blueprint by index', () => {
      const bp = makeCardioBlueprint(2);
      const dur = Duration.ofMinutes(15);
      const exercise = RecordedCardioExercise.empty(bp).withSet(0, (s) =>
        s.with({ duration: dur, completionDateTime: tick() }),
      );

      const session = new Session(
        uuid(),
        new SessionBlueprint('Test', [bp], ''),
        [exercise],
        LocalDate.of(2025, 4, 5),
        undefined,
        undefined,
      );

      const newBp = makeCardioBlueprint(2);
      const updated = session.withEditedExercise(0, newBp, false);
      const cardio = updated.recordedExercises[0]! as RecordedCardioExercise;

      // Existing duration should survive the blueprint swap
      expect(cardio.sets[0]!.duration?.equals(dur)).toBe(true);
    });

    it('new sets beyond the previous count start empty', () => {
      const bp = makeCardioBlueprint(1);
      const exercise = RecordedCardioExercise.empty(bp).withSet(0, (s) =>
        s.with({
          duration: Duration.ofMinutes(10),
          completionDateTime: tick(),
        }),
      );

      const session = new Session(
        uuid(),
        new SessionBlueprint('Test', [bp], ''),
        [exercise],
        LocalDate.of(2025, 4, 5),
        undefined,
        undefined,
      );

      const expandedBp = makeCardioBlueprint(3);
      const updated = session.withEditedExercise(0, expandedBp, false);
      const cardio = updated.recordedExercises[0]! as RecordedCardioExercise;

      expect(cardio.sets).toHaveLength(3);
      expect(cardio.sets[1]!.duration).toBeUndefined();
      expect(cardio.sets[2]!.duration).toBeUndefined();
    });

    it('uses the new set blueprint even when carrying forward existing data', () => {
      const bp = makeCardioBlueprint(1);
      const exercise = RecordedCardioExercise.empty(bp).withSet(0, (s) =>
        s.with({ duration: Duration.ofMinutes(5), completionDateTime: tick() }),
      );

      const session = new Session(
        uuid(),
        new SessionBlueprint('Test', [bp], ''),
        [exercise],
        LocalDate.of(2025, 4, 5),
        undefined,
        undefined,
      );

      const newSetBp = makeCardioSetBlueprint({
        trackDuration: true,
        trackDistance: true,
      });
      const newCardioBp = new CardioExerciseBlueprint(
        'Row',
        [newSetBp],
        '',
        '',
      );
      const updated = session.withEditedExercise(0, newCardioBp, false);
      const cardio = updated.recordedExercises[0]! as RecordedCardioExercise;

      // Blueprint on the set should reflect the new definition, not the old one
      expect(cardio.sets[0]!.blueprint.trackDistance).toBe(true);
    });
  });

  it('only modifies the targeted exercise index, leaving others untouched', () => {
    const bp0 = makeWeightedBlueprint('Squat');
    const bp1 = makeWeightedBlueprint('Bench');
    const session = makeSession([bp0, bp1]);

    const editedBp = makeWeightedBlueprint('Deadlift');
    const updated = session.withEditedExercise(0, editedBp, false);

    expect(updated.recordedExercises[1]!.blueprint.name).toBe('Bench');
  });
});
