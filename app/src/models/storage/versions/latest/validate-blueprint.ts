import Ajv from 'ajv';
import programBlueprintSchema from '@/models/generated/program-blueprint.schema.json';
import type { ProgramBlueprintJSON } from '@/models/storage/versions/latest/blueprint';

const ajv = new Ajv({ validateFormats: false, discriminator: true });
const validate = ajv.compile<ProgramBlueprintJSON>(programBlueprintSchema);

export type BlueprintValidationResult = { ok: true; value: ProgramBlueprintJSON } | { ok: false; error: string };

/**
 * Validates that `json` matches the latest {@link ProgramBlueprintJSON} shape.
 * The bundled schema only describes the latest version, so anything that might
 * be an older version must be run through `programBlueprintMigrations.migrate`
 * before it reaches here.
 */
export function validateLatestProgramBlueprint(json: unknown): BlueprintValidationResult {
  if (validate(json)) {
    return { ok: true, value: json };
  }
  return { ok: false, error: ajv.errorsText(validate.errors) };
}
