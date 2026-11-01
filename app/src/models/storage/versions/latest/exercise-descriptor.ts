export interface ExerciseDescriptorJSON {
  name: string;
  force: string | null;
  level: string;
  mechanic: string | null;
  equipment: string | null;
  muscles: string[];
  secondaryMuscles?: string[];
  instructions: string;
  category: string;
}
