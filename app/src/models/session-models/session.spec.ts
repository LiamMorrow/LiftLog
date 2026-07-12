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
import { RestTimer } from '@/models/session-models/rest-timer';
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
      expect(nextExercise?.blueprint.name).toBe(session.recordedExercises[0]!.blueprint.name);
    });

    describe('and the last completed set was exercise 0 (not a superset)', () => {
      beforeEach(() => {
        session = session.withCycledExerciseReps(0, 0, tick());
      });

      it('should have the next set be the first exercise', () => {
        const nextExercise = session.nextExercise;
        expect(nextExercise).not.toBeNull();
        expect(nextExercise?.blueprint.name).toBe(session.recordedExercises[0]!.blueprint.name);
      });
    });

    describe('and the last completed set was exercise 1 (a superset with exercise 2)', () => {
      beforeEach(() => {
        session = session.withCycledExerciseReps(1, 0, tick());
      });

      it('should have the next set be 2', () => {
        const nextExercise = session.nextExercise;
        expect(nextExercise).not.toBeNull();
        expect(nextExercise?.blueprint.name).toBe(session.recordedExercises[2]!.blueprint.name);
      });
    });

    describe('and the last completed set was exercise 2 (a superset with the previous exercise (1))', () => {
      beforeEach(() => {
        session = session.withCycledExerciseReps(2, 0, tick());
      });

      it('should have the next set be 1', () => {
        const nextExercise = session.nextExercise;
        expect(nextExercise).not.toBeNull();
        expect(nextExercise?.blueprint.name).toBe(session.recordedExercises[1]!.blueprint.name);
      });
    });

    describe('and the last completed set was exercise 3 (a superset with 4 and 5)', () => {
      beforeEach(() => {
        session = session.withCycledExerciseReps(3, 0, tick());
      });

      it('should have the next set be 4', () => {
        const nextExercise = session.nextExercise;
        expect(nextExercise).not.toBeNull();
        expect(nextExercise?.blueprint.name).toBe(session.recordedExercises[4]!.blueprint.name);
      });
    });

    describe('and the last completed set was exercise 4 (a superset with 3 and 5)', () => {
      beforeEach(() => {
        session = session.withCycledExerciseReps(4, 0, tick());
      });

      it('should have the next set be 5', () => {
        const nextExercise = session.nextExercise;
        expect(nextExercise).not.toBeNull();
        expect(nextExercise?.blueprint.name).toBe(session.recordedExercises[5]!.blueprint.name);
      });
    });

    describe('and the last completed set was exercise 5 (a superset with 3 and 4)', () => {
      beforeEach(() => {
        session = session.withCycledExerciseReps(5, 0, tick());
      });

      it('should cycle back to exercise 3', () => {
        const nextExercise = session.nextExercise;
        expect(nextExercise).not.toBeNull();
        expect(nextExercise?.blueprint.name).toBe(session.recordedExercises[3]!.blueprint.name);
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
      expect(nextExercise?.blueprint.name).toBe(session.recordedExercises[0]!.blueprint.name);
    });

    describe('and the last completed set was exercise 0 (a superset with exercise 1)', () => {
      beforeEach(() => {
        session = session.withCycledExerciseReps(0, 0, tick());
      });

      it('should have the next set be 1', () => {
        const nextExercise = session.nextExercise;
        expect(nextExercise).not.toBeNull();
        expect(nextExercise?.blueprint.name).toBe(session.recordedExercises[1]!.blueprint.name);
      });
    });

    describe('and the last completed set was exercise 1 (supersetting with 0)', () => {
      beforeEach(() => {
        session = session.withCycledExerciseReps(1, 0, tick());
      });

      it('should have the next set be 0', () => {
        const nextExercise = session.nextExercise;
        expect(nextExercise).not.toBeNull();
        expect(nextExercise?.blueprint.name).toBe(session.recordedExercises[0]!.blueprint.name);
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
      expect(nextExercise?.blueprint.name).toBe(session.recordedExercises[0]!.blueprint.name);
    });

    describe('and the last completed set was exercise 0 (not a superset)', () => {
      beforeEach(() => {
        session = session.withCycledExerciseReps(0, 0, tick());
      });

      it('should have the next set be itself (0)', () => {
        const nextExercise = session.nextExercise;
        expect(nextExercise).not.toBeNull();
        expect(nextExercise?.blueprint.name).toBe(session.recordedExercises[0]!.blueprint.name);
      });
    });

    describe('and the last completed set was exercise 1 (not a superset)', () => {
      beforeEach(() => {
        session = session.withCycledExerciseReps(1, 0, tick());
      });

      it('should have the next set be itself (1)', () => {
        const nextExercise = session.nextExercise;
        expect(nextExercise).not.toBeNull();
        expect(nextExercise?.blueprint.name).toBe(session.recordedExercises[1]!.blueprint.name);
      });
    });

    describe('and the last completed set was exercise 2 (a superset with next, but it is the last - so noop)', () => {
      beforeEach(() => {
        session = session.withCycledExerciseReps(2, 0, tick());
      });

      it('should have the next set be itself (2)', () => {
        const nextExercise = session.nextExercise;
        expect(nextExercise).not.toBeNull();
        expect(nextExercise?.blueprint.name).toBe(session.recordedExercises[2]!.blueprint.name);
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
    const updatedExercise = updated.recordedExercises[0]! as RecordedWeightedExercise;

    // All completed sets should land on the new date
    const completedSets = updatedExercise.potentialSets.filter((s) => s.set);
    expect(completedSets.every((s) => s.set!.completionDateTime.toLocalDate().equals(newDate))).toBe(true);

    // Times of day preserved
    expect(updatedExercise.potentialSets[0]!.set!.completionDateTime.toLocalTime()).toEqual(t1.toLocalTime());
    expect(updatedExercise.potentialSets[1]!.set!.completionDateTime.toLocalTime()).toEqual(t2.toLocalTime());
  });

  it('maintains relative day offsets when sets cross midnight', () => {
    const bp = makeWeightedBlueprint();
    const sessionDate = LocalDate.of(2025, 4, 5);

    // One set before midnight, one after → two different dates
    const beforeMidnight = OffsetDateTime.of(2025, 4, 5, 23, 55, 0, 0, ZoneOffset.UTC);
    const afterMidnight = OffsetDateTime.of(2025, 4, 6, 0, 5, 0, 0, ZoneOffset.UTC);

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
    const sets = (updated.recordedExercises[0]! as RecordedWeightedExercise).potentialSets;

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
    const sets = (updated.recordedExercises[0]! as RecordedWeightedExercise).potentialSets;
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
    const set = (updated.recordedExercises[0]! as RecordedWeightedExercise).potentialSets[0]!.set;
    expect(set).toBeDefined();
    expect(set!.repsCompleted).toBe(10); // repsPerSet from makeWeightedBlueprint
  });

  it('second cycle decrements reps by 1', () => {
    const session = sessionWithOneExercise();
    const t = tick();
    const after1 = session.withCycledExerciseReps(0, 0, t);
    const after2 = after1.withCycledExerciseReps(0, 0, tick());
    const set = (after2.recordedExercises[0]! as RecordedWeightedExercise).potentialSets[0]!.set;
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
    const set = (updated.recordedExercises[0]! as RecordedWeightedExercise).potentialSets[0]!.set;
    expect(set).toBeUndefined();
  });

  it('sets session date to the time date if session not yet started', () => {
    const session = sessionWithOneExercise();
    const futureTime = OffsetDateTime.of(2025, 6, 15, 12, 0, 0, 0, ZoneOffset.UTC);
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
    const sets = (updated.recordedExercises[0]! as RecordedWeightedExercise).potentialSets;
    expect(sets.every((s) => s.weight.unit === 'kilograms')).toBe(true);
  });

  it('uses pounds when useImperialUnits is true', () => {
    const session = makeSession([]);
    const updated = session.withAddedExercise(makeWeightedBlueprint(), true);
    const sets = (updated.recordedExercises[0]! as RecordedWeightedExercise).potentialSets;
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
      const sets = (updated.recordedExercises[0]! as RecordedWeightedExercise).potentialSets;
      expect(sets.every((s) => s.weight.unit === 'kilograms')).toBe(true);
    });

    it('uses pounds on type change when useImperialUnits is true', () => {
      const session = makeSession([makeCardioBlueprint()]);
      const weightedBp = makeWeightedBlueprint();
      const updated = session.withEditedExercise(0, weightedBp, true);
      const sets = (updated.recordedExercises[0]! as RecordedWeightedExercise).potentialSets;
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

      const updated = session.withEditedExercise(0, makeCardioBlueprint(), false);
      const cardio = updated.recordedExercises[0]! as RecordedCardioExercise;
      expect(cardio.sets.every((s) => s.completionDateTime === undefined)).toBe(true);
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
      const updatedExercise = updated.recordedExercises[0]! as RecordedWeightedExercise;

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
      expect((updated.recordedExercises[0]! as RecordedWeightedExercise).potentialSets).toHaveLength(2);
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
        [new PotentialSet(undefined, heavyWeight), new PotentialSet(undefined, new Weight(100, 'kilograms'))],
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
      const sets = (updated.recordedExercises[0]! as RecordedWeightedExercise).potentialSets;

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
      const newCardioBp = new CardioExerciseBlueprint('Row', [newSetBp], '', '');
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

// ─── getEmptySession ──────────────────────────────────────────────────────────

describe('Session.getEmptySession', () => {
  it('creates empty recorded exercises for each blueprint type', () => {
    const blueprint = new SessionBlueprint('Legs', [makeWeightedBlueprint(), makeCardioBlueprint(2)], '');

    const session = Session.getEmptySession(blueprint, 'kilograms');

    expect(session.recordedExercises[0]).toBeInstanceOf(RecordedWeightedExercise);
    expect((session.recordedExercises[0] as RecordedWeightedExercise).potentialSets).toHaveLength(3);
    expect(session.recordedExercises[1]).toBeInstanceOf(RecordedCardioExercise);
    expect(session.isStarted).toBe(false);
  });
});

// ─── withNoNilWeights ─────────────────────────────────────────────────────────

describe('Session.withNoNilWeights', () => {
  it('replaces nil weight units with the fallback unit', () => {
    const bp = makeWeightedBlueprint();
    const exercise = new RecordedWeightedExercise(bp, [new PotentialSet(undefined, new Weight(0, 'nil'))], undefined);
    const session = new Session(
      uuid(),
      new SessionBlueprint('Test', [bp], ''),
      [exercise],
      LocalDate.of(2025, 4, 5),
      undefined,
      undefined,
    );

    const result = session.withNoNilWeights('kilograms')!;

    expect((result.recordedExercises[0] as RecordedWeightedExercise).potentialSets[0]!.weight.unit).toBe('kilograms');
  });

  it('leaves non-nil units untouched', () => {
    const session = makeSession([makeWeightedBlueprint()]);
    const result = session.withNoNilWeights('pounds')!;
    const sets = (result.recordedExercises[0] as RecordedWeightedExercise).potentialSets;
    expect(sets.every((s) => s.weight.unit === 'kilograms')).toBe(true);
  });
});

// ─── equals ───────────────────────────────────────────────────────────────────

describe('Session.equals', () => {
  it('is false against undefined and true against itself', () => {
    const session = makeSession([makeWeightedBlueprint()]);
    expect(session.equals(undefined)).toBe(false);
    expect(session.equals(session)).toBe(true);
  });

  it('is false when the id differs', () => {
    const session = makeSession([makeWeightedBlueprint()]);
    expect(session.equals(session.with({ id: uuid() }))).toBe(false);
  });

  it('is false when the exercise count differs', () => {
    const session = makeSession([makeWeightedBlueprint()]);
    expect(session.equals(session.withAddedExercise(makeWeightedBlueprint('Bench'), false))).toBe(false);
  });
});

// ─── structural mutations ─────────────────────────────────────────────────────

describe('Session structural mutations', () => {
  it('withNothingCompleted clears recorded sets across exercises', () => {
    const t = tick();
    const bp = makeWeightedBlueprint();
    const exercise = new RecordedWeightedExercise(bp, [filledPotentialSet(10, t)], 'note');
    const session = new Session(
      uuid(),
      new SessionBlueprint('Test', [bp], ''),
      [exercise],
      LocalDate.of(2025, 4, 5),
      undefined,
      undefined,
    );

    const result = session.withNothingCompleted();

    expect((result.recordedExercises[0] as RecordedWeightedExercise).potentialSets[0]!.set).toBeUndefined();
    expect(result.isStarted).toBe(false);
  });

  it('withRemovedExercise removes from both recordedExercises and the blueprint', () => {
    const session = makeSession([makeWeightedBlueprint('Squat'), makeWeightedBlueprint('Bench')]);

    const result = session.withRemovedExercise(0);

    expect(result.recordedExercises).toHaveLength(1);
    expect(result.blueprint.exercises).toHaveLength(1);
    expect(result.recordedExercises[0]!.blueprint.name).toBe('Bench');
  });

  it('withName renames the blueprint', () => {
    const session = makeSession([makeWeightedBlueprint()]);
    expect(session.withName('Push Day').blueprint.name).toBe('Push Day');
  });
});

// ─── derived values ───────────────────────────────────────────────────────────

describe('Session derived values', () => {
  function twoExercisesStartedAt(t1: OffsetDateTime, t2: OffsetDateTime) {
    const bp0 = makeWeightedBlueprint('Squat');
    const bp1 = makeWeightedBlueprint('Bench');
    const ex0 = new RecordedWeightedExercise(bp0, [filledPotentialSet(10, t1)], undefined);
    const ex1 = new RecordedWeightedExercise(bp1, [filledPotentialSet(10, t2)], undefined);
    return new Session(
      uuid(),
      new SessionBlueprint('Test', [bp0, bp1], ''),
      [ex0, ex1],
      LocalDate.of(2025, 4, 5),
      undefined,
      undefined,
    );
  }

  it('totalWeightLifted sums weight times reps across weighted exercises', () => {
    const t = tick();
    const bp = makeWeightedBlueprint();
    const exercise = new RecordedWeightedExercise(
      bp,
      [new PotentialSet(new RecordedSet(5, t), new Weight(100, 'kilograms'))],
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
    expect(session.totalWeightLifted).toEqual(new Weight(500, 'kilograms'));
  });

  it('isComplete is true only when every exercise is complete', () => {
    const incomplete = makeSession([makeWeightedBlueprint()]);
    expect(incomplete.isComplete).toBe(false);
  });

  it('firstExercise and lastExercise track the earliest and latest recorded exercise', () => {
    const first = tickAt(10, 0);
    const last = tickAt(11, 0);
    const session = twoExercisesStartedAt(first, last);

    expect(session.firstExercise?.blueprint.name).toBe('Squat');
    expect(session.lastExercise?.blueprint.name).toBe('Bench');
    expect(session.latestWeightedExercise?.blueprint.name).toBe('Bench');
  });

  it('duration spans the first to last recorded set', () => {
    const first = tickAt(10, 0);
    const last = tickAt(10, 30);
    const session = twoExercisesStartedAt(first, last);
    expect(session.duration).toEqual(Duration.between(first, last));
  });

  it('duration is undefined when nothing is recorded', () => {
    expect(makeSession([makeWeightedBlueprint()]).duration).toBeUndefined();
  });
});

// ─── restTimerEndTime ─────────────────────────────────────────────────────────

describe('Session.restTimerEndTime', () => {
  function startedSession(reps: number, restTimerStartTime: OffsetDateTime | undefined) {
    const restTimer = restTimerStartTime ? new RestTimer(restTimerStartTime) : undefined;
    const bp = makeWeightedBlueprint();
    const t = tick();
    const exercise = new RecordedWeightedExercise(
      bp,
      [filledPotentialSet(reps, t), new PotentialSet(undefined, new Weight(100, 'kilograms'))],
      undefined,
    );
    return new Session(
      uuid(),
      new SessionBlueprint('Test', [bp], ''),
      [exercise],
      LocalDate.of(2025, 4, 5),
      undefined,
      restTimer,
    );
  }

  it('is undefined without a running rest timer', () => {
    expect(startedSession(10, undefined).restTimerEndTime).toBeUndefined();
  });

  it('uses minRest after a successful set', () => {
    const start = tickAt(12, 0);
    const session = startedSession(10, start);
    const minRest = makeWeightedBlueprint().restBetweenSets.minRest;
    expect(session.restTimerEndTime).toEqual(start.plus(minRest));
  });

  it('uses failureRest after a failed set', () => {
    const start = tickAt(12, 0);
    const session = startedSession(3, start);
    const failureRest = makeWeightedBlueprint().restBetweenSets.failureRest;
    expect(session.restTimerEndTime).toEqual(start.plus(failureRest));
  });
});

// ─── freeform / JSON ──────────────────────────────────────────────────────────

describe('Session freeform and JSON', () => {
  it('freeformSession is marked as freeform', () => {
    const session = Session.freeformSession(LocalDate.of(2025, 4, 5), undefined);
    expect(session.isFreeform).toBe(true);
    expect(makeSession([makeWeightedBlueprint()]).isFreeform).toBe(false);
  });

  it('round-trips through toJSON/fromJSON', () => {
    const t = tick();
    const bp = makeWeightedBlueprint();
    const exercise = new RecordedWeightedExercise(bp, [filledPotentialSet(10, t)], undefined);
    const session = new Session(
      '11111111-1111-1111-1111-111111111111',
      new SessionBlueprint('Test', [bp], ''),
      [exercise],
      LocalDate.of(2025, 4, 5),
      new Weight(80, 'kilograms'),
      undefined,
    );

    const restored = Session.fromJSON(session.toJSON());

    expect(restored.equals(session)).toBe(true);
  });
});

describe('Session.runningCardioSet', () => {
  it('is undefined when no cardio clock is running', () => {
    const session = makeSession([makeWeightedBlueprint(), makeCardioBlueprint(2)]);

    expect(session.runningCardioSet).toBeUndefined();
  });

  it('locates the exercise and set whose clock is running', () => {
    const session = makeSession([makeWeightedBlueprint(), makeCardioBlueprint(3)]);
    const started = session.withExercise(
      1,
      (session.recordedExercises[1] as RecordedCardioExercise).withSet(2, (s) => s.withTimerStarted(tick())),
    );

    const running = started.runningCardioSet;

    expect(running?.exerciseIndex).toBe(1);
    expect(running?.setIndex).toBe(2);
    expect(running?.set.isTimerRunning).toBe(true);
  });
});

describe('Session cardio timer', () => {
  const cardioSession = () => makeSession([makeCardioBlueprint(2), makeCardioBlueprint(2)]);

  it('starting a clock banks the set another clock was already running', () => {
    const now = tick();
    const started = cardioSession().withCardioTimerStarted(0, 0, now);
    const moved = started.withCardioTimerStarted(1, 1, now.plusSeconds(30));

    expect(moved.runningCardioSet?.exerciseIndex).toBe(1);
    expect(moved.runningCardioSet?.setIndex).toBe(1);
    expect(moved.cardioSetAt(0, 0)?.isTimerRunning).toBe(false);
    expect(moved.cardioSetAt(0, 0)?.duration).toEqual(Duration.ofSeconds(30));
  });

  it('withCardioSet edits the set and leaves the others alone', () => {
    const now = tick();
    const updated = cardioSession().withCardioSet(1, 0, (s) => s.with({ duration: Duration.ofMinutes(4) }), now);

    expect(updated.cardioSetAt(1, 0)?.duration).toEqual(Duration.ofMinutes(4));
    expect(updated.cardioSetAt(1, 1)?.duration).toBeUndefined();
    expect(updated.cardioSetAt(0, 0)?.duration).toBeUndefined();
  });

  it('withCardioSet is a no-op when the exercise is not cardio', () => {
    const session = makeSession([makeWeightedBlueprint()]);

    expect(session.withCardioSet(0, 0, (s) => s.with({ duration: Duration.ofMinutes(4) }), tick())).toBe(session);
  });
});
