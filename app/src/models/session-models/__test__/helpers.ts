import { LocalDate, OffsetDateTime, ZoneOffset } from '@js-joda/core';
import BigNumber from 'bignumber.js';
import { v4 as uuid } from 'uuid';
import {
  WeightedExerciseBlueprint,
  RepsTarget,
  WeightedExerciseBlueprintInit,
  SessionBlueprint,
  CardioExerciseBlueprint,
  CardioExerciseSetBlueprint,
  ProgressionRule,
} from '@/models/blueprint-models';
import { Weight } from '@/models/weight';
import { Session } from '@/models/session-models/session';
import { RecordedCardioExercise } from '@/models/session-models/recorded-cardio-exercise';
import {
  PotentialSet,
  RecordedSet,
  RecordedWeightedExercise,
} from '@/models/session-models/recorded-weighted-exercise';

let _tick = OffsetDateTime.parse('2025-04-05T10:00:00Z');
export function tick(): OffsetDateTime {
  _tick = _tick.plusSeconds(1);
  return _tick;
}
export function tickAt(h: number, m: number, s: number = 0): OffsetDateTime {
  return OffsetDateTime.of(2025, 4, 5, h, m, s, 0, ZoneOffset.UTC);
}

/**
 * The blueprint most specs want: a named 3×10 movement that progresses 2.5 a session. Override any
 * field by name. Every spec builds its blueprints through here rather than the constructor, so a
 * change to the blueprint's shape lands in one place.
 */
export function makeWeightedBlueprint(init: WeightedExerciseBlueprintInit = {}) {
  return WeightedExerciseBlueprint.of({
    name: 'Squat',
    progression: [ProgressionRule.load(BigNumber(2.5))],
    ...init,
  });
}

export function makeCardioSetBlueprint(
  overrides: Partial<{
    trackDuration: boolean;
    trackDistance: boolean;
    trackSteps: boolean;
  }> = {},
) {
  return new CardioExerciseSetBlueprint(
    { type: 'distance', value: { unit: 'kilometre', value: BigNumber(1000) } },
    overrides.trackDuration ?? true,
    overrides.trackDistance ?? false,
    false, // trackResistance
    false, // trackIncline
    false, // trackWeight
    overrides.trackSteps ?? false,
    undefined, // restBetweenSets
  );
}

export function makeCardioBlueprint(sets = 1) {
  return new CardioExerciseBlueprint(
    'Row',
    Array.from({ length: sets }, () => makeCardioSetBlueprint({ trackDuration: true })),
    '',
    '',
  );
}

export function makeSession(
  exercises: (WeightedExerciseBlueprint | CardioExerciseBlueprint)[],
  date = LocalDate.of(2025, 4, 5),
): Session {
  const recorded = exercises.map((bp) => {
    if (bp instanceof WeightedExerciseBlueprint) {
      return RecordedWeightedExercise.empty(bp, 'kilograms');
    }
    return RecordedCardioExercise.empty(bp);
  });
  return new Session(uuid(), new SessionBlueprint('Test', exercises, ''), recorded, date, undefined, undefined);
}

export function filledPotentialSet(
  reps: number,
  time: OffsetDateTime,
  weight = new Weight(100, 'kilograms'),
  target: RepsTarget = { min: 10, max: 10 },
) {
  return PotentialSet.of({ set: RecordedSet.of({ repsCompleted: reps, completionDateTime: time }), weight, target });
}

/** A set loaded but not yet logged — the state every set starts a session in. */
export function emptyPotentialSet(weight: Weight | number = 100, target: RepsTarget = { min: 10, max: 10 }) {
  return PotentialSet.of({
    weight: typeof weight === 'number' ? new Weight(weight, 'kilograms') : weight,
    target,
  });
}

/**
 * An exercise with the given reps logged against its blueprint's targets, the way the app seeds a
 * session. Pass `undefined` for a set that was never filled out.
 */
export function makeRecordedExercise(
  blueprint: WeightedExerciseBlueprint,
  reps: (number | undefined)[],
  weight = new Weight(100, 'kilograms'),
  at: (index: number) => OffsetDateTime = () => tick(),
) {
  return new RecordedWeightedExercise(
    blueprint,
    reps.map((r, index) => {
      const target = blueprint.repsTargetForSet(index);
      return r === undefined ? emptyPotentialSet(weight, target) : filledPotentialSet(r, at(index), weight, target);
    }),
    undefined,
  );
}

// Helper functions to match the C# test structure
export function createExerciseBlueprint(index: number, supersetWithNext: boolean): WeightedExerciseBlueprint {
  return makeWeightedBlueprint({ name: `Ex${index}`, supersetWithNext });
}

export function createSessionBlueprint(exercises: WeightedExerciseBlueprint[]): SessionBlueprint {
  return new SessionBlueprint('Test Session', exercises, '');
}

export function createSession(sessionBlueprint: SessionBlueprint, fillSets: number[] = []): Session {
  const recordedExercises = (sessionBlueprint.exercises as WeightedExerciseBlueprint[]).map(
    (exerciseBlueprint, exerciseIndex) => {
      const potentialSets = exerciseBlueprint.plannedSets.map((planned, setIndex) =>
        fillSets.includes(exerciseIndex)
          ? filledPotentialSet(
              planned.reps.max,
              tick().plusSeconds(exerciseIndex * 60 + setIndex * 10),
              new Weight(100, 'kilograms'),
              planned.reps,
            )
          : emptyPotentialSet(100, planned.reps),
      );

      return new RecordedWeightedExercise(
        exerciseBlueprint,
        potentialSets,
        undefined, // notes
      );
    },
  );

  return new Session(
    uuid(),
    sessionBlueprint,
    recordedExercises,
    LocalDate.now(),
    undefined, // bodyweight
    undefined,
  );
}
