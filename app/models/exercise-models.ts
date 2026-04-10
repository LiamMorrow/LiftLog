import { ExerciseDescriptorJSON } from './storage/versions/latest';

export interface ExerciseDescriptor {
  name: string;
  force: string | null;
  level: string;
  mechanic: string | null;
  equipment: string | null;
  muscles: string[];
  instructions: string;
  category: string;
}
export function fromExerciseDescriptorJSON(
  json: ExerciseDescriptorJSON,
): ExerciseDescriptor {
  return json;
}

export function toExerciseDescriptorJSON(
  value: ExerciseDescriptor,
): ExerciseDescriptorJSON {
  return value;
}
