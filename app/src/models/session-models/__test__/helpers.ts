import { LocalDate, OffsetDateTime, ZoneOffset } from '@js-joda/core';
import BigNumber from 'bignumber.js';
import { v4 as uuid } from 'uuid';
import {
  WeightedExerciseBlueprint,
  Rest,
  SessionBlueprint,
  CardioExerciseBlueprint,
  CardioExerciseSetBlueprint,
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

export function makeWeightedBlueprint(
  name = 'Squat',
  supersetWithNext = false,
) {
  return new WeightedExerciseBlueprint(
    name,
    3,
    10,
    new BigNumber('2.5'),
    Rest.medium,
    supersetWithNext,
    '',
    '',
  );
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
    overrides.trackSteps ?? false,
    false, // trackResistance
    false, // trackIncline
    false, // trackWeight
  );
}

export function makeCardioBlueprint(sets = 1) {
  return new CardioExerciseBlueprint(
    'Row',
    Array.from({ length: sets }, () =>
      makeCardioSetBlueprint({ trackDuration: true }),
    ),
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
  return new Session(
    uuid(),
    new SessionBlueprint('Test', exercises, ''),
    recorded,
    date,
    undefined,
    undefined,
  );
}

export function filledPotentialSet(
  reps: number,
  time: OffsetDateTime,
  weight = new Weight(100, 'kilograms'),
) {
  return new PotentialSet(new RecordedSet(reps, time), weight);
}

// Helper functions to match the C# test structure
export function createExerciseBlueprint(
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

export function createSessionBlueprint(
  exercises: WeightedExerciseBlueprint[],
): SessionBlueprint {
  return new SessionBlueprint('Test Session', exercises, '');
}

export function createSession(
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
              tick().plusSeconds(exerciseIndex * 60 + setIndex * 10),
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
    undefined,
  );
}
