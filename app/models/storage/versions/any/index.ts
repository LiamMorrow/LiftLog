import {
  SessionJSON as V1SessionJSON,
  ProgramBlueprintJSON as V1ProgramBlueprintJSON,
} from '../v1';

// Add each json version here, we use this type to allow us to migrate over time
export type AnyVersionSessionJSON = V1SessionJSON;
export type AnyVersionProgramBlueprintJSON = V1ProgramBlueprintJSON;
