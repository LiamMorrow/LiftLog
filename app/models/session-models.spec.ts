import { describe, it, expect, beforeEach } from 'vitest';
import {
  Session,
  RecordedWeightedExercise,
  RecordedSet,
  PotentialSet,
} from '@/models/session-models';
import { LocalDate, OffsetDateTime } from '@js-joda/core';
import BigNumber from 'bignumber.js';
import { v4 as uuid } from 'uuid';
import {
  WeightedExerciseBlueprint,
  Rest,
  SessionBlueprint,
} from '@/models/blueprint-models';
import { Weight } from '@/models/weight';

// Helper functions to match the C# test structure
function createExerciseBlueprint(
  index: number,
  supersetWithNext: boolean,
): WeightedExerciseBlueprint {
  return new WeightedExerciseBlueprint(
    `Ex${index}`,
    3, // sets
    10, // repsPerSet
    new BigNumber('2.5'), // weightIncreaseOnSuccess
    Rest.medium,
    supersetWithNext,
    '', // notes
    '', // link
  );
}

function createSessionBlueprint(
  exercises: WeightedExerciseBlueprint[],
): SessionBlueprint {
  return new SessionBlueprint('Test Session', exercises, '');
}

function createSession(
  sessionBlueprint: SessionBlueprint,
  fillSets: number[] = [],
): Session {
  const recordedExercises = (
    sessionBlueprint.exercises as WeightedExerciseBlueprint[]
  ).map((exerciseBlueprint, exerciseIndex) => {
    const potentialSets = Array.from({ length: exerciseBlueprint.sets }).map(
      (_, setIndex) => {
        const shouldFillSet = fillSets.includes(exerciseIndex);
        const set = shouldFillSet
          ? new RecordedSet(
              exerciseBlueprint.repsPerSet,
              OffsetDateTime.now().plusSeconds(
                exerciseIndex * 60 + setIndex * 10,
              ),
            )
          : undefined;

        return new PotentialSet(set, new Weight(100, 'kilograms'));
      },
    );

    return new RecordedWeightedExercise(
      exerciseBlueprint,
      potentialSets,
      undefined, // notes
    );
  });

  return new Session(
    uuid(),
    sessionBlueprint,
    recordedExercises,
    LocalDate.now(),
    undefined, // bodyweight
  );
}

function cycleExerciseReps(
  session: Session,
  exerciseIndex: number,
  setIndex: number,
): Session {
  const recordedExercises = [...session.recordedExercises];
  const targetExercise = recordedExercises[
    exerciseIndex
  ] as RecordedWeightedExercise;
  const potentialSets = [...targetExercise.potentialSets];

  // Complete the set
  potentialSets[setIndex] = potentialSets[setIndex].with({
    set: new RecordedSet(
      targetExercise.blueprint.repsPerSet,
      OffsetDateTime.now(),
    ),
  });

  recordedExercises[exerciseIndex] = targetExercise.with({
    potentialSets: potentialSets.map((ps) => ps.toPOJO()),
  });

  return session.with({
    recordedExercises,
  });
}

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
        session.recordedExercises[0].blueprint.name,
      );
    });

    describe('and the last completed set was exercise 0 (not a superset)', () => {
      beforeEach(() => {
        session = cycleExerciseReps(session, 0, 0);
      });

      it('should have the next set be the first exercise', () => {
        const nextExercise = session.nextExercise;
        expect(nextExercise).not.toBeNull();
        expect(nextExercise?.blueprint.name).toBe(
          session.recordedExercises[0].blueprint.name,
        );
      });
    });

    describe('and the last completed set was exercise 1 (a superset with exercise 2)', () => {
      beforeEach(() => {
        session = cycleExerciseReps(session, 1, 0);
      });

      it('should have the next set be 2', () => {
        const nextExercise = session.nextExercise;
        expect(nextExercise).not.toBeNull();
        expect(nextExercise?.blueprint.name).toBe(
          session.recordedExercises[2].blueprint.name,
        );
      });
    });

    describe('and the last completed set was exercise 2 (a superset with the previous exercise (1))', () => {
      beforeEach(() => {
        session = cycleExerciseReps(session, 2, 0);
      });

      it('should have the next set be 1', () => {
        const nextExercise = session.nextExercise;
        expect(nextExercise).not.toBeNull();
        expect(nextExercise?.blueprint.name).toBe(
          session.recordedExercises[1].blueprint.name,
        );
      });
    });

    describe('and the last completed set was exercise 3 (a superset with 4 and 5)', () => {
      beforeEach(() => {
        session = cycleExerciseReps(session, 3, 0);
      });

      it('should have the next set be 4', () => {
        const nextExercise = session.nextExercise;
        expect(nextExercise).not.toBeNull();
        expect(nextExercise?.blueprint.name).toBe(
          session.recordedExercises[4].blueprint.name,
        );
      });
    });

    describe('and the last completed set was exercise 4 (a superset with 3 and 5)', () => {
      beforeEach(() => {
        session = cycleExerciseReps(session, 4, 0);
      });

      it('should have the next set be 5', () => {
        const nextExercise = session.nextExercise;
        expect(nextExercise).not.toBeNull();
        expect(nextExercise?.blueprint.name).toBe(
          session.recordedExercises[5].blueprint.name,
        );
      });
    });

    describe('and the last completed set was exercise 5 (a superset with 3 and 4)', () => {
      beforeEach(() => {
        session = cycleExerciseReps(session, 5, 0);
      });

      it('should cycle back to exercise 3', () => {
        const nextExercise = session.nextExercise;
        expect(nextExercise).not.toBeNull();
        expect(nextExercise?.blueprint.name).toBe(
          session.recordedExercises[3].blueprint.name,
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
        session.recordedExercises[0].blueprint.name,
      );
    });

    describe('and the last completed set was exercise 0 (a superset with exercise 1)', () => {
      beforeEach(() => {
        session = cycleExerciseReps(session, 0, 0);
      });

      it('should have the next set be 1', () => {
        const nextExercise = session.nextExercise;
        expect(nextExercise).not.toBeNull();
        expect(nextExercise?.blueprint.name).toBe(
          session.recordedExercises[1].blueprint.name,
        );
      });
    });

    describe('and the last completed set was exercise 1 (supersetting with 0)', () => {
      beforeEach(() => {
        session = cycleExerciseReps(session, 1, 0);
      });

      it('should have the next set be 0', () => {
        const nextExercise = session.nextExercise;
        expect(nextExercise).not.toBeNull();
        expect(nextExercise?.blueprint.name).toBe(
          session.recordedExercises[0].blueprint.name,
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
        session.recordedExercises[0].blueprint.name,
      );
    });

    describe('and the last completed set was exercise 0 (not a superset)', () => {
      beforeEach(() => {
        session = cycleExerciseReps(session, 0, 0);
      });

      it('should have the next set be itself (0)', () => {
        const nextExercise = session.nextExercise;
        expect(nextExercise).not.toBeNull();
        expect(nextExercise?.blueprint.name).toBe(
          session.recordedExercises[0].blueprint.name,
        );
      });
    });

    describe('and the last completed set was exercise 1 (not a superset)', () => {
      beforeEach(() => {
        session = cycleExerciseReps(session, 1, 0);
      });

      it('should have the next set be itself (1)', () => {
        const nextExercise = session.nextExercise;
        expect(nextExercise).not.toBeNull();
        expect(nextExercise?.blueprint.name).toBe(
          session.recordedExercises[1].blueprint.name,
        );
      });
    });

    describe('and the last completed set was exercise 2 (a superset with next, but it is the last - so noop)', () => {
      beforeEach(() => {
        session = cycleExerciseReps(session, 2, 0);
      });

      it('should have the next set be itself (2)', () => {
        const nextExercise = session.nextExercise;
        expect(nextExercise).not.toBeNull();
        expect(nextExercise?.blueprint.name).toBe(
          session.recordedExercises[2].blueprint.name,
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
