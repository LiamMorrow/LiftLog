import { ExerciseDescriptor } from '@/models/exercise-models';
import { normalizeExerciseName, SessionBlueprint } from '@/models/blueprint-models';
import { RecordedWeightedExercise, Session } from '@/models/session-models';

export const secondaryMuscleWeight = 0.5;

export interface ExerciseSets {
  name: string;
  sets: number;
}

export interface MuscleContribution {
  exerciseName: string;
  sets: number;
  secondary: boolean;
}

export interface MuscleVolume {
  muscle: string;
  sets: number;
  contributions: MuscleContribution[];
}

export interface UnmatchedExercise {
  name: string;
  exerciseId: string | undefined;
}

export interface MuscleVolumeAnalysis {
  muscles: MuscleVolume[];
  unmatchedExercises: UnmatchedExercise[];
}

export type DescriptorIndex = Map<string, { id: string; descriptor: ExerciseDescriptor }>;

export function plannedExerciseSets(sessions: SessionBlueprint[]): ExerciseSets[] {
  return sessions.flatMap((session) =>
    session.exercises.flatMap((exercise) =>
      exercise.type === 'WeightedExerciseBlueprint' ? [{ name: exercise.name, sets: exercise.plannedSets.length }] : [],
    ),
  );
}

export function completedExerciseSets(session: Session): ExerciseSets[] {
  return session.recordedExercises.flatMap((exercise) =>
    exercise instanceof RecordedWeightedExercise && exercise.completedSetCount
      ? [{ name: exercise.blueprint.name, sets: exercise.completedSetCount }]
      : [],
  );
}

function matchKey(name: string) {
  return normalizeExerciseName(name.replace(/[^\p{L}\p{N}]+/gu, ' '));
}

export function indexDescriptorsByName(exercises: Record<string, ExerciseDescriptor>): DescriptorIndex {
  const index: DescriptorIndex = new Map();
  for (const [id, descriptor] of Object.entries(exercises)) {
    for (const key of [descriptor.name, id, `${descriptor.name}s`, `${descriptor.name}es`].map(matchKey)) {
      if (!index.get(key)?.descriptor.muscles.length) {
        index.set(key, { id, descriptor });
      }
    }
  }
  return index;
}

function contributionVolume(contribution: MuscleContribution) {
  return contribution.sets * (contribution.secondary ? secondaryMuscleWeight : 1);
}

export function analyseMuscleVolume(
  exercises: ExerciseSets[],
  index: DescriptorIndex,
  allMuscles: string[],
): MuscleVolumeAnalysis {
  const byMuscle = new Map<string, Map<string, MuscleContribution>>(allMuscles.map((muscle) => [muscle, new Map()]));
  const unmatched = new Map<string, UnmatchedExercise>();

  for (const exercise of exercises) {
    const key = matchKey(exercise.name);
    const entry = index.get(key);
    if (!entry?.descriptor.muscles.length) {
      unmatched.set(key, unmatched.get(key) ?? { name: exercise.name, exerciseId: entry?.id });
      continue;
    }
    const secondary = new Set(entry.descriptor.secondaryMuscles);
    for (const muscle of new Set(entry.descriptor.muscles)) {
      const contributions = byMuscle.get(muscle) ?? new Map<string, MuscleContribution>();
      const existing = contributions.get(key);
      contributions.set(key, {
        exerciseName: existing?.exerciseName ?? exercise.name,
        sets: (existing?.sets ?? 0) + exercise.sets,
        secondary: secondary.has(muscle),
      });
      byMuscle.set(muscle, contributions);
    }
  }

  const muscles = [...byMuscle.entries()]
    .map(([muscle, contributions]) => {
      const sorted = [...contributions.values()].sort((a, b) => contributionVolume(b) - contributionVolume(a));
      return { muscle, sets: sorted.reduce((sum, c) => sum + contributionVolume(c), 0), contributions: sorted };
    })
    .sort((a, b) => b.sets - a.sets || a.muscle.localeCompare(b.muscle));

  return { muscles, unmatchedExercises: [...unmatched.values()] };
}
