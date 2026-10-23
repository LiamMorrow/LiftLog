import { MovementKey, ProgressionKey, Resistance } from '@/models/blueprint-models';
import { Session } from '@/models/session-models';
import { Weight } from '@/models/weight';

export type PersonalRecordKind = 'heaviest' | 'oneRepMax' | 'mostReps' | 'bestSet';

const kindOrder: PersonalRecordKind[] = ['heaviest', 'oneRepMax', 'mostReps', 'bestSet'];

type RecordOf<K extends PersonalRecordKind, T> = K extends PersonalRecordKind
  ? { kind: K; exerciseOrd: number; exerciseName: string; value: T; previous: T }
  : never;

/** Weights are in kilograms. A reps record carries the working weight it was done at. */
export type PersonalRecord =
  | RecordOf<'heaviest' | 'oneRepMax', Weight>
  | (RecordOf<'mostReps' | 'bestSet', number> & { weight: Weight; resistance: Resistance });

/**
 * One exercise's completed sets in one session. The SQL form is the summary
 * stored on `recorded_exercise`.
 */
export interface Performance {
  sessionId: string;
  exerciseOrd: number;
  exerciseName: string;
  movementKey: MovementKey;
  progressionKey: ProgressionKey;
  resistance: Resistance;
  topWeightKg: number;
  /** The lightest set, so "most reps at" this weight means every rep was at it or heavier. */
  workingWeightKg: number;
  totalReps: number;
  bestSetReps: number;
  /** Only an externally loaded lift has one. */
  oneRepMaxKg: number | null;
}

/** The best of the earlier sessions that a performance competes with, or null when there were none. */
interface EarlierBests {
  topWeightKg: number | null;
  oneRepMaxKg: number | null;
  /** Earlier sessions of the lineage at this working weight or heavier. */
  totalReps: number | null;
  totalRepsAtSameWeight: boolean;
  /** Earlier unloaded or bodyweight sessions of the movement at this working weight or heavier. */
  bestSetReps: number | null;
  bestSetAtSameWeight: boolean;
}

/** The same float arithmetic as SQL's `kilograms`, so both sides compare identical numbers. */
function kilograms(weight: Weight): number {
  return weight.unit === 'pounds' ? weight.value.toNumber() / 2.20462 : weight.value.toNumber();
}

const kg = (value: number) => new Weight(value, 'kilograms');

export function performancesOf(session: Session): Performance[] {
  return session.recordedExercises.flatMap((exercise, exerciseOrd) => {
    if (exercise.type !== 'RecordedWeightedExercise') {
      return [];
    }
    const { resistance } = exercise.blueprint;
    const sets = exercise.potentialSets.flatMap((potentialSet) =>
      potentialSet.set && potentialSet.set.repsCompleted > 0
        ? [{ reps: potentialSet.set.repsCompleted, kg: resistance === 'none' ? 0 : kilograms(potentialSet.weight) }]
        : [],
    );
    if (!sets.length) {
      return [];
    }
    return [
      {
        sessionId: session.id,
        exerciseOrd,
        exerciseName: exercise.blueprint.name,
        movementKey: exercise.movementKey(),
        progressionKey: exercise.progressionKey(),
        resistance,
        topWeightKg: Math.max(...sets.map((x) => x.kg)),
        workingWeightKg: Math.min(...sets.map((x) => x.kg)),
        totalReps: sets.reduce((total, x) => total + x.reps, 0),
        bestSetReps: Math.max(...sets.map((x) => x.reps)),
        oneRepMaxKg: resistance === 'external' ? Math.max(...sets.map((x) => x.kg * (1 + x.reps / 30))) : null,
      },
    ];
  });
}

function recordsOf(performance: Performance, earlier: EarlierBests): PersonalRecord[] {
  const { exerciseOrd, exerciseName, resistance } = performance;
  const records: PersonalRecord[] = [];
  if (
    resistance !== 'none' &&
    performance.topWeightKg > 0 &&
    earlier.topWeightKg !== null &&
    performance.topWeightKg > earlier.topWeightKg
  ) {
    records.push({
      kind: 'heaviest',
      exerciseOrd,
      exerciseName,
      value: kg(performance.topWeightKg),
      previous: kg(earlier.topWeightKg),
    });
  }
  if (
    performance.oneRepMaxKg !== null &&
    performance.oneRepMaxKg > 0 &&
    earlier.oneRepMaxKg !== null &&
    performance.oneRepMaxKg > earlier.oneRepMaxKg
  ) {
    records.push({
      kind: 'oneRepMax',
      exerciseOrd,
      exerciseName,
      value: kg(performance.oneRepMaxKg),
      previous: kg(earlier.oneRepMaxKg),
    });
  }
  if (earlier.totalRepsAtSameWeight && earlier.totalReps !== null && performance.totalReps > earlier.totalReps) {
    records.push({
      kind: 'mostReps',
      exerciseOrd,
      exerciseName,
      value: performance.totalReps,
      previous: earlier.totalReps,
      weight: kg(performance.workingWeightKg),
      resistance,
    });
  }
  if (
    resistance !== 'external' &&
    earlier.bestSetAtSameWeight &&
    earlier.bestSetReps !== null &&
    performance.bestSetReps > earlier.bestSetReps
  ) {
    records.push({
      kind: 'bestSet',
      exerciseOrd,
      exerciseName,
      value: performance.bestSetReps,
      previous: earlier.bestSetReps,
      weight: kg(performance.workingWeightKg),
      resistance,
    });
  }
  return records;
}

const amountOf = (record: PersonalRecord) =>
  record.kind === 'heaviest' || record.kind === 'oneRepMax' ? record.value.value.toNumber() : record.value;

/** Of two records of one kind for one movement in one session, the better one, or the earlier exercise on a tie. */
function better(a: PersonalRecord | undefined, b: PersonalRecord): PersonalRecord {
  if (!a || amountOf(b) > amountOf(a) || (amountOf(b) === amountOf(a) && b.exerciseOrd < a.exerciseOrd)) {
    return b;
  }
  return a;
}

/** The most reps at `weightKg` or heavier, from a map of the most reps at each weight. */
function mostAtOrAbove(byWeight: Map<number, number> | undefined, weightKg: number): number | null {
  let most: number | null = null;
  for (const [kg, reps] of byWeight ?? []) {
    if (kg >= weightKg && (most === null || reps > most)) {
      most = reps;
    }
  }
  return most;
}

function raise<K>(map: Map<K, number>, key: K, value: number) {
  map.set(key, Math.max(map.get(key) ?? value, value));
}

function nested<K, V>(map: Map<K, V>, key: K, create: () => V): V {
  const existing = map.get(key);
  if (existing) {
    return existing;
  }
  const created = create();
  map.set(key, created);
  return created;
}

/**
 * Records per session, from performances walked oldest to newest with each session's performances together. A
 * record only counts against an *earlier* session - otherwise the first time anyone lifts anything is a record, and a
 * user with a single event in your feed gets a badge on everything they do. A movement done twice in one session
 * keeps only its better showing of each kind.
 */
export function personalRecordsOf(performancesOldestFirst: Performance[]): Map<string, PersonalRecord[]> {
  const topWeightKg = new Map<MovementKey, number>();
  const oneRepMaxKg = new Map<MovementKey, number>();
  const totalRepsByWeight = new Map<ProgressionKey, Map<number, number>>();
  const bestSetRepsByWeight = new Map<MovementKey, Map<number, number>>();
  const recordsBySession = new Map<string, PersonalRecord[]>();

  let index = 0;
  while (index < performancesOldestFirst.length) {
    const sessionId = performancesOldestFirst[index]!.sessionId;
    const session: Performance[] = [];
    while (performancesOldestFirst[index]?.sessionId === sessionId) {
      session.push(performancesOldestFirst[index]!);
      index++;
    }

    const best = new Map<string, PersonalRecord>();
    for (const performance of session) {
      const { movementKey, progressionKey, workingWeightKg } = performance;
      const totalReps = totalRepsByWeight.get(progressionKey);
      const bestSetReps = bestSetRepsByWeight.get(movementKey);
      const earlier: EarlierBests = {
        topWeightKg: topWeightKg.get(movementKey) ?? null,
        oneRepMaxKg: oneRepMaxKg.get(movementKey) ?? null,
        totalReps: mostAtOrAbove(totalReps, workingWeightKg),
        totalRepsAtSameWeight: totalReps?.has(workingWeightKg) ?? false,
        bestSetReps: mostAtOrAbove(bestSetReps, workingWeightKg),
        bestSetAtSameWeight: bestSetReps?.has(workingWeightKg) ?? false,
      };
      for (const record of recordsOf(performance, earlier)) {
        const key = `${movementKey}:${record.kind}`;
        best.set(key, better(best.get(key), record));
      }
    }
    if (best.size) {
      recordsBySession.set(
        sessionId,
        [...best.values()].sort(
          (a, b) => a.exerciseOrd - b.exerciseOrd || kindOrder.indexOf(a.kind) - kindOrder.indexOf(b.kind),
        ),
      );
    }

    for (const performance of session) {
      const { movementKey, resistance, workingWeightKg } = performance;
      if (resistance !== 'none') {
        raise(topWeightKg, movementKey, performance.topWeightKg);
      }
      if (performance.oneRepMaxKg !== null) {
        raise(oneRepMaxKg, movementKey, performance.oneRepMaxKg);
      }
      if (resistance !== 'external') {
        raise(
          nested(bestSetRepsByWeight, movementKey, () => new Map<number, number>()),
          workingWeightKg,
          performance.bestSetReps,
        );
      }
      raise(
        nested(totalRepsByWeight, performance.progressionKey, () => new Map<number, number>()),
        workingWeightKg,
        performance.totalReps,
      );
    }
  }

  return recordsBySession;
}

export function findPersonalRecords(sessionsOldestFirst: Session[]): Map<string, PersonalRecord[]> {
  return personalRecordsOf(sessionsOldestFirst.flatMap(performancesOf));
}
