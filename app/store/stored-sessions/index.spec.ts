import { describe, expect, it } from 'vitest';
import { LocalDate, OffsetDateTime, ZoneOffset, YearMonth } from '@js-joda/core';
import BigNumber from 'bignumber.js';
import { v4 as uuid } from 'uuid';
import { selectSessionsInMonth } from '@/store/stored-sessions';
import {
  Rest,
  SessionBlueprint,
  WeightedExerciseBlueprint,
} from '@/models/blueprint-models';
import {
  PotentialSet,
  RecordedSet,
  RecordedWeightedExercise,
  Session,
} from '@/models/session-models';
import { Weight } from '@/models/weight';

function createSessionWithCompletionTime(
  sessionDate: LocalDate,
  completionTime: OffsetDateTime,
  name: string,
) {
  const blueprint = new SessionBlueprint(
    name,
    [
      new WeightedExerciseBlueprint(
        `${name} Exercise`,
        1,
        5,
        new BigNumber(0),
        Rest.medium,
        false,
        '',
        '',
      ),
    ],
    '',
  );
  const exerciseBlueprint = blueprint.exercises[0] as WeightedExerciseBlueprint;
  const recordedExercise = new RecordedWeightedExercise(
    exerciseBlueprint,
    [
      new PotentialSet(
        new RecordedSet(exerciseBlueprint.repsPerSet, completionTime),
        new Weight(100, 'kilograms'),
      ),
    ],
    undefined,
  );

  return new Session(uuid(), blueprint, [recordedExercise], sessionDate, undefined);
}

describe('stored sessions sorting', () => {
  it('sorts sessions in a month by the actual completion time, not only the date', () => {
    const sameDay = LocalDate.of(2026, 4, 10);
    const earlier = createSessionWithCompletionTime(
      sameDay,
      OffsetDateTime.of(2026, 4, 10, 8, 30, 0, 0, ZoneOffset.UTC),
      'Morning',
    );
    const later = createSessionWithCompletionTime(
      sameDay,
      OffsetDateTime.of(2026, 4, 10, 18, 15, 0, 0, ZoneOffset.UTC),
      'Evening',
    );

    const state = {
      storedSessions: {
        sessions: {
          [earlier.id]: earlier.toPOJO(),
          [later.id]: later.toPOJO(),
        },
      },
    };

    const ordered = selectSessionsInMonth(
      state as never,
      YearMonth.of(2026, 4),
    );

    expect(ordered.map((session) => session.blueprint.name)).toEqual([
      'Evening',
      'Morning',
    ]);
  });
});
