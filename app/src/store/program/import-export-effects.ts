import {
  parseProgramBlueprintFile,
  PLAN_FILE_EXTENSION,
  PLAN_FILE_MIME,
  type PlanFileFailure,
  serializeProgramBlueprint,
} from '@/models/plan-file';
import { showSnackbar } from '@/store/app';
import {
  exportPlan,
  importPlanFromFile,
  importPlanFromPicker,
  importPlanFromUri,
  setPendingImport,
} from '@/store/program';
import { AddEffectFn } from '@/store/store';
import { File } from 'expo-file-system';

const PLAN_IMPORT_ERROR_KEYS: Record<PlanFileFailure, string> = {
  notAPlan: 'plan.import.error.message',
  needsNewerApp: 'plan.import.error.needs_newer_app.message',
};

/** Turns a plan name into a safe file name, e.g. "Push / Pull!" -> "Push_Pull". */
function toFileName(name: string): string {
  const cleaned = name.replace(/[^\p{L}\p{N}]+/gu, '_').replace(/^_+|_+$/g, '');
  return `${cleaned || 'plan'}.${PLAN_FILE_EXTENSION}`;
}

export function applyProgramImportExportEffects(addEffect: AddEffectFn) {
  addEffect(exportPlan, async ({ payload: { programId } }, { getState, extra: { fileExportService } }) => {
    const blueprint = getState().program.savedPrograms[programId];
    if (!blueprint) {
      return;
    }
    await fileExportService.exportBytes(
      toFileName(blueprint.name),
      serializeProgramBlueprint(blueprint),
      PLAN_FILE_MIME,
    );
  });

  addEffect(importPlanFromPicker, async (_, { dispatch, extra: { filePickerService } }) => {
    const picked = await filePickerService.pickFile();
    if (!picked) {
      return;
    }
    dispatch(importPlanFromFile({ name: picked.name, bytes: picked.bytes }));
  });

  addEffect(importPlanFromUri, async ({ payload: { uri } }, { dispatch, extra: { tolgee, logger } }) => {
    let bytes: Uint8Array;
    try {
      bytes = await new File(uri).bytes();
    } catch (e) {
      logger.error(`Failed to read plan file at ${uri}:`, e);
      dispatch(showSnackbar({ text: tolgee.t('plan.import.error.message') }));
      return;
    }
    dispatch(importPlanFromFile({ bytes }));
  });

  addEffect(importPlanFromFile, async ({ payload: { bytes } }, { dispatch, extra: { tolgee, logger } }) => {
    const result = parseProgramBlueprintFile(bytes);
    if (!result.ok) {
      logger.error('Failed to import plan file', { failure: result.failure, error: result.error });
      dispatch(showSnackbar({ text: tolgee.t(PLAN_IMPORT_ERROR_KEYS[result.failure]) }));
      return;
    }
    dispatch(setPendingImport({ programBlueprint: result.blueprint }));
  });
}
