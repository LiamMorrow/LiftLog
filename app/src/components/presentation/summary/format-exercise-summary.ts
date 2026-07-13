import { RecordedExercise, RecordedWeightedExercise, Session } from '@/models/session-models';
import { Weight } from '@/models/weight';
import { formatDistance } from '@/utils/distance';
import { formatCardioTarget } from '@/utils/format-cardio-target';
import { formatTimeSpan } from '@/utils/format-time-span';
import { localeFormatBigNumber } from '@/utils/locale-bignumber';

/**
 * A text rendering of an exercise, for surfaces that summarise a session rather than let you work through it.
 * Sets that repeat collapse into a multiplier -- three identical sets are one fact, not three -- but sets that
 * differ are kept apart, because a pyramid is the interesting thing about a pyramid. A weightless exercise says
 * nothing about weight rather than claiming "0 kg".
 */
export function formatExerciseSummary(
  exercise: RecordedExercise,
  options: { isFilled: boolean; showWeight: boolean },
): string {
  if (exercise instanceof RecordedWeightedExercise) {
    return options.isFilled
      ? formatRuns(filledRuns(exercise, options.showWeight))
      : formatPlanned(exercise, options.showWeight);
  }

  const sets = options.isFilled
    ? exercise.sets.map((set) =>
        [
          set.duration && formatTimeSpan(set.duration),
          set.distance && formatDistance(set.distance),
          set.incline && `${localeFormatBigNumber(set.incline)} incl`,
          set.resistance && `${localeFormatBigNumber(set.resistance)} res`,
        ]
          .filter((part) => !!part)
          .join(' '),
      )
    : exercise.sets.map((set) => formatCardioTarget(set.blueprint.target));

  return collapse(sets.filter((set) => set.length > 0)).join(' · ');
}

/** Kilograms-and-pounds arithmetic is not a thing, so the session's own unit wins. */
export function formatSessionVolume(session: Session): string | undefined {
  let total: Weight | undefined;

  for (const exercise of session.recordedExercises) {
    if (!(exercise instanceof RecordedWeightedExercise)) continue;

    for (const potentialSet of exercise.potentialSets) {
      if (!potentialSet.set || potentialSet.weight.value.isZero()) continue;

      const moved = potentialSet.weight.multipliedBy(potentialSet.set.repsCompleted);
      total = total ? total.plus(moved) : moved;
    }
  }

  return total?.shortLocaleFormat(0);
}

interface SetRun {
  label: string;
  weight: string;
  count: number;
}

function filledRuns(exercise: RecordedWeightedExercise, showWeight: boolean): SetRun[] {
  return runsOf(
    exercise.potentialSets
      .filter((potentialSet) => potentialSet.set)
      .map((potentialSet) => ({
        label: potentialSet.set!.repsCompleted.toString(),
        weight: weightOf(potentialSet.weight, showWeight),
      })),
  );
}

/**
 * A plan is a shape, not a log: every set is the same reps, so the only thing that can vary is the weight, and
 * spelling each one out reads as noise. The whole exercise becomes one line, with a range when the weight steps.
 */
function formatPlanned(exercise: RecordedWeightedExercise, showWeight: boolean): string {
  const sets = exercise.potentialSets;
  const shape = `${sets.length} × ${exercise.blueprint.repsPerSet}`;

  const weights = sets.map((set) => set.weight).filter((weight) => !weight.value.isZero());
  if (!showWeight || weights.length === 0) {
    return shape;
  }

  const heaviest = Weight.max(...weights);
  const lightest = Weight.min(...weights).convertTo(heaviest.unit);

  // The unit belongs to the range, not to each end of it.
  return heaviest.equals(lightest)
    ? `${shape} @ ${heaviest.shortLocaleFormat()}`
    : `${shape} @ ${localeFormatBigNumber(lightest.value)}–${heaviest.shortLocaleFormat()}`;
}

function weightOf(weight: Weight, showWeight: boolean): string {
  return showWeight && !weight.value.isZero() ? weight.shortLocaleFormat() : '';
}

function runsOf(sets: { label: string; weight: string }[]): SetRun[] {
  const runs: SetRun[] = [];

  for (const set of sets) {
    const previous = runs.at(-1);
    if (previous && previous.label === set.label && previous.weight === set.weight) {
      previous.count++;
    } else {
      runs.push({ ...set, count: 1 });
    }
  }

  return runs;
}

/** Consecutive runs at one weight share a single "@ weight", so the unit is not repeated down the line. */
function formatRuns(runs: SetRun[]): string {
  const groups: { weight: string; parts: string[] }[] = [];

  for (const run of runs) {
    const part = run.count > 1 ? `${run.count} × ${run.label}` : run.label;
    const previous = groups.at(-1);

    if (previous && previous.weight === run.weight) {
      previous.parts.push(part);
    } else {
      groups.push({ weight: run.weight, parts: [part] });
    }
  }

  return groups
    .map((group) => (group.weight ? `${group.parts.join(', ')} @ ${group.weight}` : group.parts.join(', ')))
    .join(' · ');
}

function collapse(labels: string[]): string[] {
  return runsOf(labels.map((label) => ({ label, weight: '' }))).map((run) =>
    run.count > 1 ? `${run.count} × ${run.label}` : run.label,
  );
}
