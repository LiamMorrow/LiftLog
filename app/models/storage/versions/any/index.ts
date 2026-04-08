import { SessionJSON as V1SessionJSON } from '../v1';

// Add each json version here, we use this type to allow us to migrate over time
export type AnyVersionSessionJSON = V1SessionJSON;
