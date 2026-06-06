import { version } from './version';

export interface ExerciseDescriptorJSON {
  version?: typeof version;
  name: string;
  force: string | null;
  level: string;
  mechanic: string | null;
  equipment: string | null;
  muscles: string[];
  instructions: string;
  category: string;
}
