import { ProgramBlueprint } from '@/models/blueprint-models';
import type { AnyVersionProgramBlueprintJSON } from '@/models/storage/versions/any';
import { programBlueprintMigrations } from '@/models/storage/versions/migrations';
import { validateLatestProgramBlueprint } from '@/models/storage/versions/latest/validate-blueprint';
import { fromJsonBytes, toJsonBytes } from '@/services/encryption-service';

export const PLAN_FILE_EXTENSION = 'liftlogplan';
export const PLAN_FILE_MIME = 'application/json';

export type ParsedPlanFile =
  | { ok: true; blueprint: ProgramBlueprint }
  | { ok: false; error: string };

export function serializeProgramBlueprint(blueprint: ProgramBlueprint): Uint8Array {
  return toJsonBytes(blueprint.toJSON());
}

/**
 * Parses the bytes of a `.liftlogplan` file into a {@link ProgramBlueprint}.
 * Any historical version is upgraded to the latest before it is validated
 * against the latest schema — validation is the final trust gate.
 */
export function parseProgramBlueprintFile(bytes: Uint8Array): ParsedPlanFile {
  let parsed: unknown;
  try {
    parsed = fromJsonBytes(bytes);
  } catch {
    return { ok: false, error: 'The file is not valid JSON.' };
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return { ok: false, error: 'The file is not a workout plan.' };
  }

  let migrated: unknown;
  try {
    migrated = programBlueprintMigrations.migrate(parsed as AnyVersionProgramBlueprintJSON);
  } catch {
    return { ok: false, error: 'The file is not a recognised workout plan.' };
  }

  const validation = validateLatestProgramBlueprint(migrated);
  if (!validation.ok) {
    return { ok: false, error: validation.error };
  }

  return { ok: true, blueprint: ProgramBlueprint.fromJSON(validation.value) };
}
