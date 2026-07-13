import { Session } from '@/models/session-models';
import { ActivityLevel, MAX_ACTIVITY_LEVEL, VolumeScale } from '@/store/activity/activity-types';

/** Kilograms moved. Cardio contributes nothing, so a cardio-only session scores zero — see `levelFor`. */
export function sessionVolume(session: Session): number {
  let total = 0;
  for (const exercise of session.recordedExercises) {
    if (exercise.type !== 'RecordedWeightedExercise') {
      continue;
    }
    for (const potentialSet of exercise.potentialSets) {
      if (!potentialSet.set) {
        continue;
      }
      total += potentialSet.weight.convertTo('kilograms').value.toNumber() * potentialSet.set.repsCompleted;
    }
  }
  return total;
}

/** Linear-interpolated percentile over an ascending-sorted array. */
function percentile(ascending: number[], fraction: number): number {
  if (ascending.length === 0) return 0;
  if (ascending.length === 1) return ascending[0]!;

  const position = (ascending.length - 1) * fraction;
  const lowerIndex = Math.floor(position);
  const upperIndex = Math.ceil(position);
  const lower = ascending[lowerIndex]!;
  const upper = ascending[upperIndex]!;
  return lower + (upper - lower) * (position - lowerIndex);
}

export function volumeScaleOf(volumes: number[]): VolumeScale {
  const ascending = [...volumes].sort((a, b) => a - b);
  return { lo: percentile(ascending, 0.1), hi: percentile(ascending, 0.9) };
}

/** Never returns 0 for a day that was trained — level 0 is reserved for "no session at all". */
export function levelFor(volume: number, scale: VolumeScale): ActivityLevel {
  // No spread to grade against (one session, or a run of identical ones).
  if (scale.hi <= scale.lo) {
    return 3;
  }

  const fraction = Math.min(1, Math.max(0, (volume - scale.lo) / (scale.hi - scale.lo)));
  return (1 + Math.round(fraction * (MAX_ACTIVITY_LEVEL - 1))) as ActivityLevel;
}
