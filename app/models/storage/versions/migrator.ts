import {
  ExerciseDescriptorJSON,
  LatestVersion,
  ProgramBlueprintJSON,
  SessionJSON,
} from './latest';
import {
  AnyVersionExerciseDescriptorJSON,
  AnyVersionProgramBlueprintJSON,
  AnyVersionSessionJSON,
} from './any';

export class MigratorVAnyToLatest {
  static migrateProgram(
    modelVersion: number,
    value: AnyVersionProgramBlueprintJSON,
  ): ProgramBlueprintJSON {
    if (modelVersion === LatestVersion) {
      return value;
    }
    if (modelVersion < 1) {
      throw new Error(`Unknown model version ${modelVersion}`);
    }
    // The idea is when we have more, we can run the specific migrations from say V1 -> V2 incrementing the model version recursively, but let's see
    throw new Error(`Unknown model version ${modelVersion}`);
  }

  static migrateSession(
    modelVersion: number,
    value: AnyVersionSessionJSON,
  ): SessionJSON {
    if (modelVersion === LatestVersion) {
      return value;
    }
    if (modelVersion < 1) {
      throw new Error(`Unknown model version ${modelVersion}`);
    }
    // The idea is when we have more, we can run the specific migrations from say V1 -> V2 incrementing the model version recursively, but let's see
    throw new Error(`Unknown model version ${modelVersion}`);
  }

  static migrateExerciseDescriptor(
    modelVersion: number,
    value: AnyVersionExerciseDescriptorJSON,
  ): ExerciseDescriptorJSON {
    if (modelVersion === LatestVersion) {
      return value;
    }
    if (modelVersion < 1) {
      throw new Error(`Unknown model version ${modelVersion}`);
    }
    // The idea is when we have more, we can run the specific migrations from say V1 -> V2 incrementing the model version recursively, but let's see
    throw new Error(`Unknown model version ${modelVersion}`);
  }
}
