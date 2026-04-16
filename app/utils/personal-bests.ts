import {
  Distance,
  DistanceUnit,
  NormalizedName,
} from '@/models/blueprint-models';
import { Weight, WeightUnit } from '@/models/weight';
import {
  RecordedCardioExercise,
  RecordedWeightedExercise,
  Session,
} from '@/models/session-models';
import { formatDuration } from '@/utils/format-date';
import { formatDistance } from '@/utils/distance';
import { LocalDate, OffsetDateTime, ZoneId, Duration } from '@js-joda/core';
import BigNumber from 'bignumber.js';

export type PersonalBestFilter =
  | 'all'
  | 'strength'
  | 'volume'
  | 'reps'
  | 'cardio'
  | 'recent';

export type PersonalBestSort =
  | 'most-recent'
  | 'heaviest'
  | 'biggest-improvement';

export type PersonalBestEntryKind = 'weighted' | 'cardio';

export type PersonalBestCategoryId =
  | 'max-weight'
  | 'estimated-1rm'
  | 'session-volume'
  | 'reps-at-weight'
  | 'longest-duration'
  | 'longest-distance';

export type PersonalBestValue =
  | { kind: 'weight'; weight: Weight }
  | { kind: 'volume'; weight: Weight }
  | { kind: 'reps-at-weight'; reps: number; weight: Weight }
  | { kind: 'duration'; duration: Duration }
  | { kind: 'distance'; distance: Distance };

export interface PersonalBestRecord {
  value: PersonalBestValue;
  achievedOn: LocalDate;
  achievedAt: OffsetDateTime;
}

export interface PersonalBestCategorySummary {
  id: PersonalBestCategoryId;
  current: PersonalBestRecord;
  previous?: PersonalBestRecord;
  history: PersonalBestRecord[];
  isRecent: boolean;
}

export interface PersonalBestListEntry {
  entryKey: string;
  exerciseKey: string;
  exerciseName: string;
  kind: PersonalBestEntryKind;
  category: PersonalBestCategorySummary;
  categories: PersonalBestCategorySummary[];
  availableFilters: PersonalBestFilter[];
  improvementDisplay?: string;
  improvementScore: number;
  heaviestComparable: Weight;
  mostRecentDate: LocalDate;
  isRecent: boolean;
}

export interface PersonalBestSummary {
  totalPbs: number;
  recentPbs: number;
  strongestLift?: PersonalBestListEntry;
  mostImprovedLift?: PersonalBestListEntry;
}

export interface PersonalBestOverview {
  summary: PersonalBestSummary;
  entries: PersonalBestListEntry[];
}

type Accumulator = {
  exerciseKey: string;
  exerciseName: string;
  kind: PersonalBestEntryKind;
  categories: Partial<
    Record<PersonalBestCategoryId, PersonalBestCategorySummary>
  >;
};

export function buildPersonalBestOverview(
  sessions: Session[],
  preferredUnit: WeightUnit,
  now = LocalDate.now(),
): PersonalBestOverview {
  const orderedSessions = [...sessions].sort((a, b) =>
    a.date.compareTo(b.date),
  );
  const accumulators = new Map<string, Accumulator>();

  for (const session of orderedSessions) {
    for (const exercise of session.recordedExercises) {
      if (!exercise.isStarted) {
        continue;
      }

      if (exercise instanceof RecordedWeightedExercise) {
        const exerciseKey = getExerciseKey('weighted', exercise.blueprint.name);
        const accumulator = getOrCreateAccumulator(
          accumulators,
          exerciseKey,
          exercise.blueprint.name,
          'weighted',
        );
        collectWeightedPersonalBests(accumulator, exercise, session.date);
        continue;
      }

      const exerciseKey = getExerciseKey('cardio', exercise.blueprint.name);
      const accumulator = getOrCreateAccumulator(
        accumulators,
        exerciseKey,
        exercise.blueprint.name,
        'cardio',
      );
      collectCardioPersonalBests(accumulator, exercise, session.date);
    }
  }

  const entries = Array.from(accumulators.values()).flatMap((accumulator) =>
    accumulatorToListEntries(accumulator, preferredUnit, now),
  );

  const weightedEntries = entries.filter((entry) => entry.kind === 'weighted');

  const strongestLift = weightedEntries
    .slice()
    .sort((a, b) => compareWeights(b.heaviestComparable, a.heaviestComparable))
    .at(0);
  const mostImprovedLift = entries
    .filter((entry) => entry.improvementScore > 0)
    .slice()
    .sort((a, b) => b.improvementScore - a.improvementScore)
    .at(0);

  return {
    summary: {
      totalPbs: entries.length,
      recentPbs: entries.filter((entry) => entry.isRecent).length,
      ...(strongestLift ? { strongestLift } : {}),
      ...(mostImprovedLift ? { mostImprovedLift } : {}),
    },
    entries,
  };
}

export function filterAndSortPersonalBestEntries(
  entries: PersonalBestListEntry[],
  filter: PersonalBestFilter,
  sort: PersonalBestSort,
) {
  return entries
    .filter((entry) => entryMatchesFilter(entry, filter))
    .slice()
    .sort((a, b) => compareEntries(a, b, sort));
}

export function getSessionPersonalBestEntries(
  sessions: Session[],
  session: Session,
  preferredUnit: WeightUnit,
) {
  const sessionsWithTarget = sessions.some((item) => item.id === session.id)
    ? sessions
    : [...sessions, session];
  const allEntries = buildPersonalBestOverview(
    sessionsWithTarget,
    preferredUnit,
  ).entries;
  const previousEntries = buildPersonalBestOverview(
    sessionsWithTarget.filter((item) => item.id !== session.id),
    preferredUnit,
  ).entries;
  const previousEntriesByKey = new Map(
    previousEntries.map((entry) => [entry.entryKey, entry]),
  );

  return allEntries
    .filter((entry) => {
      if (!entry.category.current.achievedOn.equals(session.date)) {
        return false;
      }

      const previousEntry = previousEntriesByKey.get(entry.entryKey);
      if (!previousEntry) {
        return true;
      }

      return (
        comparePersonalBestValues(
          entry.category.current.value,
          previousEntry.category.current.value,
        ) > 0
      );
    })
    .sort((left, right) => compareEntries(left, right, 'most-recent'));
}

export function formatPersonalBestValue(
  value: PersonalBestValue,
  decimalPlaces = 0,
) {
  switch (value.kind) {
    case 'weight':
    case 'volume':
      return value.weight.shortLocaleFormat(decimalPlaces);
    case 'reps-at-weight':
      return `${value.reps} @ ${value.weight.shortLocaleFormat(decimalPlaces)}`;
    case 'duration':
      return formatDuration(value.duration, 'hours-mins');
    case 'distance':
      return formatDistance(value.distance);
  }
}

export function getPersonalBestCategoryLabelKey(
  categoryId: PersonalBestCategoryId,
) {
  switch (categoryId) {
    case 'max-weight':
      return 'progress.pbs.category.max_weight';
    case 'estimated-1rm':
      return 'progress.pbs.category.estimated_1rm';
    case 'session-volume':
      return 'progress.pbs.category.session_volume';
    case 'reps-at-weight':
      return 'progress.pbs.category.reps_at_weight';
    case 'longest-duration':
      return 'progress.pbs.category.longest_duration';
    case 'longest-distance':
      return 'progress.pbs.category.longest_distance';
  }
}

function collectWeightedPersonalBests(
  accumulator: Accumulator,
  exercise: RecordedWeightedExercise,
  fallbackDate: LocalDate,
) {
  for (const set of exercise.potentialSets) {
    if (!set.set) {
      continue;
    }

    const achievedAt = set.set.completionDateTime;
    const achievedOn = achievedAt.toLocalDate();
    recordPersonalBest(
      accumulator,
      'max-weight',
      {
        value: { kind: 'weight', weight: set.weight },
        achievedAt,
        achievedOn,
      },
      comparePersonalBestValues,
    );

    const estimatedOneRepMax = set.weight.multipliedBy(
      new BigNumber(1).plus(new BigNumber(set.set.repsCompleted).div(30)),
    );
    recordPersonalBest(
      accumulator,
      'estimated-1rm',
      {
        value: { kind: 'weight', weight: estimatedOneRepMax },
        achievedAt,
        achievedOn,
      },
      comparePersonalBestValues,
    );

    recordPersonalBest(
      accumulator,
      'reps-at-weight',
      {
        value: {
          kind: 'reps-at-weight',
          reps: set.set.repsCompleted,
          weight: set.weight,
        },
        achievedAt,
        achievedOn,
      },
      comparePersonalBestValues,
    );
  }

  const completedSets = exercise.potentialSets.filter((set) => !!set.set);
  if (!completedSets.length) {
    return;
  }

  const achievedAt =
    exercise.latestTime ??
    fallbackDate
      .atTime(12, 0)
      .atZone(ZoneId.systemDefault())
      .toOffsetDateTime();
  recordPersonalBest(
    accumulator,
    'session-volume',
    {
      value: {
        kind: 'volume',
        weight: completedSets.reduce(
          (sum, set) =>
            sum.plus(set.weight.multipliedBy(set.set?.repsCompleted ?? 0)),
          Weight.NIL,
        ),
      },
      achievedAt,
      achievedOn: achievedAt.toLocalDate(),
    },
    comparePersonalBestValues,
  );
}

function collectCardioPersonalBests(
  accumulator: Accumulator,
  exercise: RecordedCardioExercise,
  fallbackDate: LocalDate,
) {
  for (const set of exercise.sets) {
    const achievedAt =
      set.completionDateTime ??
      fallbackDate
        .atTime(12, 0)
        .atZone(ZoneId.systemDefault())
        .toOffsetDateTime();
    const achievedOn = achievedAt.toLocalDate();

    if (set.duration && !set.duration.equals(Duration.ZERO)) {
      recordPersonalBest(
        accumulator,
        'longest-duration',
        {
          value: { kind: 'duration', duration: set.duration },
          achievedAt,
          achievedOn,
        },
        comparePersonalBestValues,
      );
    }

    if (set.distance) {
      recordPersonalBest(
        accumulator,
        'longest-distance',
        {
          value: { kind: 'distance', distance: set.distance },
          achievedAt,
          achievedOn,
        },
        comparePersonalBestValues,
      );
    }
  }
}

function recordPersonalBest(
  accumulator: Accumulator,
  categoryId: PersonalBestCategoryId,
  record: PersonalBestRecord,
  compare: (left: PersonalBestValue, right: PersonalBestValue) => number,
) {
  const existing = accumulator.categories[categoryId];
  if (!existing) {
    accumulator.categories[categoryId] = {
      id: categoryId,
      current: record,
      history: [record],
      isRecent: false,
    };
    return;
  }

  if (compare(record.value, existing.current.value) > 0) {
    existing.previous = existing.current;
    existing.current = record;
    existing.history = [...existing.history, record];
  }
}

function accumulatorToListEntries(
  accumulator: Accumulator,
  preferredUnit: WeightUnit,
  now: LocalDate,
) {
  const categories = Object.values(accumulator.categories)
    .filter(
      (category): category is PersonalBestCategorySummary =>
        !!category?.history.length,
    )
    .map((category) => ({
      ...category,
      isRecent: isRecentDate(category.current.achievedOn, now),
    }));

  if (!categories.length) {
    return [];
  }

  const availableFilters = buildAvailableFilters(accumulator.kind, categories);
  return categories.map((category) => {
    const heaviestComparable = getComparableWeight(
      category.current.value,
    ).convertTo(preferredUnit);
    const improvementDisplay = formatImprovement(category, preferredUnit);
    const improvementScore = getImprovementScore(category, preferredUnit);

    return {
      entryKey: `${accumulator.exerciseKey}:${category.id}`,
      exerciseKey: accumulator.exerciseKey,
      exerciseName: accumulator.exerciseName,
      kind: accumulator.kind,
      category,
      categories,
      availableFilters,
      improvementScore,
      heaviestComparable,
      mostRecentDate: category.current.achievedOn,
      isRecent: category.isRecent,
      ...(improvementDisplay ? { improvementDisplay } : {}),
    };
  });
}

function buildAvailableFilters(
  kind: PersonalBestEntryKind,
  categories: PersonalBestCategorySummary[],
): PersonalBestFilter[] {
  const filters = new Set<PersonalBestFilter>(['all']);
  if (kind === 'cardio') {
    filters.add('cardio');
  } else {
    if (
      categories.some((category) =>
        ['max-weight', 'estimated-1rm'].includes(category.id),
      )
    ) {
      filters.add('strength');
    }
    if (categories.some((category) => category.id === 'session-volume')) {
      filters.add('volume');
    }
    if (categories.some((category) => category.id === 'reps-at-weight')) {
      filters.add('reps');
    }
  }
  return [...filters];
}

function formatImprovement(
  category: PersonalBestCategorySummary,
  preferredUnit: WeightUnit,
) {
  if (!category.previous) {
    return undefined;
  }

  const currentValue = category.current.value;
  const previousValue = category.previous.value;
  if (currentValue.kind !== previousValue.kind) {
    return undefined;
  }

  switch (currentValue.kind) {
    case 'weight':
    case 'volume': {
      const previousWeightValue = previousValue as Extract<
        PersonalBestValue,
        { kind: 'weight' | 'volume' }
      >;
      const change = currentValue.weight
        .convertTo(preferredUnit)
        .minus(previousWeightValue.weight.convertTo(preferredUnit));
      return `+${change.shortLocaleFormat(0)}`;
    }
    case 'reps-at-weight': {
      const previousRepsValue = previousValue as Extract<
        PersonalBestValue,
        { kind: 'reps-at-weight' }
      >;
      const repsChange = currentValue.reps - previousRepsValue.reps;
      if (repsChange > 0) {
        return `+${repsChange}`;
      }
      const weightChange = currentValue.weight
        .convertTo(preferredUnit)
        .minus(previousRepsValue.weight.convertTo(preferredUnit));
      return `+${weightChange.shortLocaleFormat(0)}`;
    }
    case 'duration': {
      const previousDurationValue = previousValue as Extract<
        PersonalBestValue,
        { kind: 'duration' }
      >;
      const minutes =
        currentValue.duration.toMinutes() -
        previousDurationValue.duration.toMinutes();
      return minutes > 0 ? `+${minutes} min` : undefined;
    }
    case 'distance': {
      const previousDistanceValue = previousValue as Extract<
        PersonalBestValue,
        { kind: 'distance' }
      >;
      const metres =
        toMetres(currentValue.distance) -
        toMetres(previousDistanceValue.distance);
      return metres > 0
        ? `+${formatDistance({
            unit: metres >= 1000 ? 'kilometre' : 'metre',
            value: new BigNumber(metres >= 1000 ? metres / 1000 : metres),
          })}`
        : undefined;
    }
  }
}

function getImprovementScore(
  category: PersonalBestCategorySummary,
  preferredUnit: WeightUnit,
) {
  if (!category.previous) {
    return 0;
  }

  const currentValue = category.current.value;
  const previousValue = category.previous.value;
  if (currentValue.kind !== previousValue.kind) {
    return 0;
  }

  switch (currentValue.kind) {
    case 'weight':
    case 'volume': {
      const previousWeightValue = previousValue as Extract<
        PersonalBestValue,
        { kind: 'weight' | 'volume' }
      >;
      return currentValue.weight
        .convertTo(preferredUnit)
        .minus(previousWeightValue.weight.convertTo(preferredUnit))
        .value.toNumber();
    }
    case 'reps-at-weight': {
      const previousRepsValue = previousValue as Extract<
        PersonalBestValue,
        { kind: 'reps-at-weight' }
      >;
      return (
        (currentValue.reps - previousRepsValue.reps) * 1000 +
        currentValue.weight
          .convertTo(preferredUnit)
          .minus(previousRepsValue.weight.convertTo(preferredUnit))
          .value.toNumber()
      );
    }
    case 'duration': {
      const previousDurationValue = previousValue as Extract<
        PersonalBestValue,
        { kind: 'duration' }
      >;
      return (
        currentValue.duration.seconds() -
        previousDurationValue.duration.seconds()
      );
    }
    case 'distance': {
      const previousDistanceValue = previousValue as Extract<
        PersonalBestValue,
        { kind: 'distance' }
      >;
      return (
        toMetres(currentValue.distance) -
        toMetres(previousDistanceValue.distance)
      );
    }
  }
}

function entryMatchesFilter(
  entry: PersonalBestListEntry,
  filter: PersonalBestFilter,
) {
  if (filter === 'all') {
    return true;
  }
  if (filter === 'recent') {
    return entry.isRecent;
  }
  return entry.availableFilters.includes(filter);
}

function compareEntries(
  left: PersonalBestListEntry,
  right: PersonalBestListEntry,
  sort: PersonalBestSort,
) {
  switch (sort) {
    case 'biggest-improvement':
      return (
        right.improvementScore - left.improvementScore ||
        left.exerciseName.localeCompare(right.exerciseName)
      );
    case 'heaviest':
      return (
        compareWeights(right.heaviestComparable, left.heaviestComparable) ||
        left.exerciseName.localeCompare(right.exerciseName)
      );
    case 'most-recent':
      return (
        right.mostRecentDate.compareTo(left.mostRecentDate) ||
        left.exerciseName.localeCompare(right.exerciseName)
      );
  }
}

function comparePersonalBestValues(
  left: PersonalBestValue,
  right: PersonalBestValue,
) {
  if (left.kind !== right.kind) {
    return 0;
  }

  switch (left.kind) {
    case 'weight':
    case 'volume': {
      const rightWeightValue = right as Extract<
        PersonalBestValue,
        { kind: 'weight' | 'volume' }
      >;
      return compareWeights(left.weight, rightWeightValue.weight);
    }
    case 'reps-at-weight':
      return (
        left.reps -
          (right as Extract<PersonalBestValue, { kind: 'reps-at-weight' }>)
            .reps ||
        compareWeights(
          left.weight,
          (right as Extract<PersonalBestValue, { kind: 'reps-at-weight' }>)
            .weight,
        )
      );
    case 'duration':
      return left.duration.compareTo(
        (right as Extract<PersonalBestValue, { kind: 'duration' }>).duration,
      );
    case 'distance':
      return (
        toMetres(left.distance) -
        toMetres(
          (right as Extract<PersonalBestValue, { kind: 'distance' }>).distance,
        )
      );
  }
}

function compareWeights(left: Weight, right: Weight) {
  if (left.equals(right, true)) {
    return 0;
  }
  return left.isGreaterThan(right) ? 1 : -1;
}

function getComparableWeight(value: PersonalBestValue) {
  switch (value.kind) {
    case 'weight':
    case 'volume':
      return value.weight;
    case 'reps-at-weight':
      return value.weight;
    case 'duration':
      return new Weight(value.duration.seconds(), 'kilograms');
    case 'distance':
      return new Weight(toMetres(value.distance), 'kilograms');
  }
}

function getExerciseKey(kind: PersonalBestEntryKind, exerciseName: string) {
  return `${kind}:${new NormalizedName(exerciseName).toString()}`;
}

function getOrCreateAccumulator(
  accumulators: Map<string, Accumulator>,
  exerciseKey: string,
  exerciseName: string,
  kind: PersonalBestEntryKind,
) {
  const existing = accumulators.get(exerciseKey);
  if (existing) {
    return existing;
  }

  const accumulator: Accumulator = {
    exerciseKey,
    exerciseName,
    kind,
    categories: {},
  };
  accumulators.set(exerciseKey, accumulator);
  return accumulator;
}

function isRecentDate(date: LocalDate, now: LocalDate) {
  return !date.isBefore(now.minusDays(30));
}

function toMetres(distance: Distance) {
  switch (distance.unit) {
    case 'metre':
      return distance.value.toNumber();
    case 'kilometre':
      return distance.value.multipliedBy(1000).toNumber();
    case 'mile':
      return distance.value.multipliedBy(1609.344).toNumber();
    case 'yard':
      return distance.value.multipliedBy(0.9144).toNumber();
  }
}

export function metresToDistance(
  metres: number,
  unit: DistanceUnit = metres >= 1000 ? 'kilometre' : 'metre',
): Distance {
  switch (unit) {
    case 'metre':
      return { unit, value: new BigNumber(metres) };
    case 'kilometre':
      return { unit, value: new BigNumber(metres).dividedBy(1000) };
    case 'mile':
      return { unit, value: new BigNumber(metres).dividedBy(1609.344) };
    case 'yard':
      return { unit, value: new BigNumber(metres).dividedBy(0.9144) };
  }
}
