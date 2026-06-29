import {
  ProgramBlueprintPOJO,
  Rest,
  WeightedExerciseBlueprint,
  SessionBlueprint,
  ProgramBlueprint,
  CardioTarget,
  CardioExerciseBlueprint,
  Distance,
  DistanceUnits,
  CardioExerciseSetBlueprint,
} from '@/models/blueprint-models';
import { Weight } from '@/models/weight';
import {
  Session,
  RecordedWeightedExercise,
  RecordedSet,
  PotentialSet,
  RecordedCardioExercise,
  RecordedCardioExerciseSet,
} from '@/models/session-models';
import { Duration, LocalDate, OffsetDateTime, LocalTime, ZoneOffset } from '@js-joda/core';
import BigNumber from 'bignumber.js';
import fc from 'fast-check';

function optional<T>(gen: fc.Arbitrary<T>): fc.Arbitrary<T | undefined> {
  return fc.option(gen, { nil: undefined });
}

const BigNumberGenerator = fc
  .tuple(fc.integer(), fc.nat({ max: 1_000_000_000 }))
  .map(([whole, fractional]) => new BigNumber(`${whole}.${fractional}`));

const WeightUnitGenerator = fc.boolean().map((x) => (x ? 'kilograms' : 'pounds'));

export const WeightGenerator = fc
  .tuple(WeightUnitGenerator, BigNumberGenerator)
  .map(([unit, value]) => new Weight(value, unit));

const LocalDateGenerator = fc
  .tuple(
    fc.integer({ min: 1900, max: 2100 }),
    fc.integer({ min: 1, max: 12 }),
    fc.integer({ min: 1, max: 28 }), // Simplified to avoid invalid dates
  )
  .map(([year, month, day]) => LocalDate.of(year, month, day));

const DurationGenerator = fc
  .tuple(fc.integer({ min: 0 }), fc.integer({ min: 0 }))
  .map(([second, nano]) => Duration.ofSeconds(second).plusNanos(nano));

const LocalTimeGenerator = fc
  .tuple(fc.integer({ min: 0, max: 23 }), fc.integer({ min: 0, max: 59 }), fc.integer({ min: 0, max: 59 }))
  .map(([hour, minute, second]) => LocalTime.of(hour, minute, second));

const ZoneOffsetGenerator = fc.oneof(
  fc.constant(ZoneOffset.UTC),
  fc.constant(ZoneOffset.ofHours(10)),
  fc.constant(ZoneOffset.ofHours(-6)),
);

const OffsetDateTimeGenerator = fc
  .tuple(LocalDateGenerator, LocalTimeGenerator, ZoneOffsetGenerator)
  .map(([date, time, zone]) => OffsetDateTime.of(date.atTime(time), zone));

const RestGenerator = fc.constantFrom(Rest.short, Rest.medium, Rest.long);

const WeightedExerciseBlueprintGenerator = fc
  .record({
    type: fc.constant('WeightedExerciseBlueprint'),
    name: fc.string(),
    sets: fc.integer({ min: 1, max: 10 }),
    repsPerSet: fc.integer({ min: 1, max: 20 }),
    weightIncreaseOnSuccess: BigNumberGenerator,
    restBetweenSets: RestGenerator,
    supersetWithNext: fc.boolean(),
    notes: fc.string(),
    link: fc.webUrl(),
  })
  .map((x) => WeightedExerciseBlueprint.empty().with(x));

const CardioTargetGenerator = fc.record<CardioTarget>({
  type: fc.constant('time'),
  value: fc.constant(Duration.ofMillis(1203)),
});

const CardioExerciseSetBlueprintGenerator = fc
  .record({
    target: CardioTargetGenerator,
    trackDuration: fc.boolean(),
    trackDistance: fc.boolean(),
    trackResistance: fc.boolean(),
    trackIncline: fc.boolean(),
    trackWeight: fc.boolean(),
    trackSteps: fc.boolean(),
  })
  .map(
    (x) =>
      new CardioExerciseSetBlueprint(
        x.target,
        x.trackDuration,
        x.trackDistance,
        x.trackResistance,
        x.trackIncline,
        x.trackWeight,
        x.trackSteps,
      ),
  );

const CardioExerciseBlueprintGenerator = fc
  .record({
    name: fc.string(),
    sets: fc.array(CardioExerciseSetBlueprintGenerator, { minLength: 1 }),
    notes: fc.string(),
    link: fc.webUrl(),
  })
  .map((x) => CardioExerciseBlueprint.empty().with(x));

export const SessionBlueprintGenerator = fc
  .record({
    name: fc.string(),
    exercises: fc.array(fc.oneof(WeightedExerciseBlueprintGenerator, CardioExerciseBlueprintGenerator), {
      maxLength: 10,
    }),
    notes: fc.string(),
  })
  .map((x) => new SessionBlueprint(x.name, x.exercises, x.notes));

export const ProgramBlueprintGenerator = fc
  .record<ProgramBlueprintPOJO>({
    type: fc.constant('ProgramBlueprint'),
    name: fc.string(),
    sessions: fc.array(SessionBlueprintGenerator, { maxLength: 5 }),
    lastEdited: LocalDateGenerator,
  })
  .map(ProgramBlueprint.fromPOJO);

const RecordedSetGenerator = fc
  .record({
    repsCompleted: fc.integer({ min: 0, max: 100 }),
    completionDateTime: OffsetDateTimeGenerator,
  })
  .map((x) => new RecordedSet(x.repsCompleted, x.completionDateTime));

const PotentialSetGenerator = fc
  .record({
    set: fc.option(RecordedSetGenerator, {
      nil: undefined,
    }),
    weight: WeightGenerator,
  })
  .map((x) => new PotentialSet(x.set, x.weight));

const DistanceUnitGenerator = fc.oneof(...DistanceUnits.map(fc.constant));

const DistanceGenerator = fc.record<Distance>({
  unit: DistanceUnitGenerator,
  value: BigNumberGenerator,
});

const RecordedCardioSetGenerator = fc
  .record({
    blueprint: CardioExerciseSetBlueprintGenerator,
    incline: optional(BigNumberGenerator),
    duration: optional(DurationGenerator),
    distance: optional(DistanceGenerator),
    resistance: optional(BigNumberGenerator),
    completionDateTime: optional(OffsetDateTimeGenerator),
    weight: optional(WeightGenerator),
    steps: optional(fc.integer()),
    currentBlockStartTime: fc.constant(undefined),
  })
  .map(
    (x) =>
      new RecordedCardioExerciseSet(
        x.blueprint,
        x.completionDateTime,
        x.duration,
        x.distance,
        x.resistance,
        x.incline,
        x.weight,
        x.steps,
        x.currentBlockStartTime,
      ),
  );

const RecordedCardioExerciseGenerator = fc
  .record({
    blueprint: CardioExerciseBlueprintGenerator,
    notes: optional(fc.string()),
    sets: fc.array(RecordedCardioSetGenerator, { minLength: 1 }),
  })
  .map((x) => new RecordedCardioExercise(x.blueprint, x.sets, x.notes));

const RecordedWeightedExerciseGenerator = fc
  .record({
    blueprint: WeightedExerciseBlueprintGenerator,
    potentialSets: fc.array(PotentialSetGenerator, { maxLength: 10 }),
    notes: optional(fc.string()),
  })
  .map((x) => new RecordedWeightedExercise(x.blueprint, x.potentialSets, x.notes));

export const SessionGenerator = fc
  .tuple(
    fc.record({
      type: fc.constant('Session'),
      id: fc.uuid(),
      blueprint: SessionBlueprintGenerator,
      date: LocalDateGenerator,
      bodyweight: fc.option(WeightGenerator, { nil: undefined }),
      restTimerStartTime: fc.constant(undefined),
    }),
    fc.array(fc.oneof(RecordedWeightedExerciseGenerator, RecordedCardioExerciseGenerator), { maxLength: 10 }),
  )
  .map(
    ([session, exercises]) =>
      new Session(
        session.id,
        session.blueprint.with({
          exercises: exercises.map((x) => x.blueprint),
        }),
        exercises,
        session.date,
        session.bodyweight,
        session.restTimerStartTime,
      ),
  );
