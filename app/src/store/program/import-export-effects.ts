import { ProgramBlueprint } from '@/models/blueprint-models';
import { parseProgramBlueprintFile, PLAN_FILE_EXTENSION, PLAN_FILE_MIME, serializeProgramBlueprint } from '@/models/plan-file';
import { showSnackbar } from '@/store/app';
import { exportPlan, importPlanFromFile, importPlanFromPicker, setPendingImport } from '@/store/program';
import { AddEffectFn } from '@/store/store';

/** Turns a plan name into a safe file name, e.g. "Push / Pull!" -> "Push_Pull". */
function toFileName(name: string): string {
  const cleaned = name.replace(/[^\p{L}\p{N}]+/gu, '_').replace(/^_+|_+$/g, '');
  return `${cleaned || 'plan'}.${PLAN_FILE_EXTENSION}`;
}

export function applyProgramImportExportEffects(addEffect: AddEffectFn) {
  addEffect(exportPlan, async ({ payload: { programId } }, { getState, extra: { fileExportService } }) => {
    const pojo = getState().program.savedPrograms[programId];
    if (!pojo) {
      return;
    }
    const blueprint = ProgramBlueprint.fromPOJO(pojo);
    await fileExportService.exportBytes(toFileName(blueprint.name), serializeProgramBlueprint(blueprint), PLAN_FILE_MIME);
  });

  addEffect(importPlanFromPicker, async (_, { dispatch, extra: { filePickerService } }) => {
    const picked = await filePickerService.pickFile();
    if (!picked) {
      return;
    }
    dispatch(importPlanFromFile({ name: picked.name, bytes: picked.bytes }));
  });

  addEffect(importPlanFromFile, async ({ payload: { bytes } }, { dispatch, extra: { tolgee } }) => {
    const result = parseProgramBlueprintFile(bytes);
    if (!result.ok) {
      dispatch(showSnackbar({ text: tolgee.t('plan.import.error.message') }));
      return;
    }
    dispatch(setPendingImport({ programBlueprint: result.blueprint }));
  });
}
