import { ExerciseDescriptor } from '@/models/exercise-models';

export function resolveExerciseVariation(
  source: ExerciseDescriptor,
  variation: string,
  exercises: Readonly<Record<string, ExerciseDescriptor>>,
): { exercise: ExerciseDescriptor; isNew: boolean } {
  const suffix = variation.trim();
  const name = suffix ? `${source.name} (${suffix})` : source.name;
  const existing = Object.values(exercises).find((exercise) => exercise.name.toLowerCase() === name.toLowerCase());
  return {
    exercise: existing ?? { ...source, name },
    isNew: !existing,
  };
}
