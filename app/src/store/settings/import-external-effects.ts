import { showSnackbar } from '@/store/app';
import { importBackupData, importFromExternal } from '@/store/settings';
import { AddEffectFn } from '@/store/store';
import { setStatsIsDirty } from '@/store/stats';
import { getImportForFitNotes, getImportForStrongLifts } from '@/services/csv-import';
import { WeightUnit } from '@/models/weight';

export function addImportExternalEffects(addEffect: AddEffectFn) {
  addEffect(
    importFromExternal,
    async ({ payload: { format } }, { dispatch, getState, extra: { filePickerService, tolgee, logger } }) => {
      const file = await filePickerService.pickFile();
      if (!file) {
        return;
      }

      const defaultWeightUnit: WeightUnit = getState().settings.useImperialUnits ? 'pounds' : 'kilograms';

      try {
        let backupData;
        switch (format) {
          case 'CSV':
            backupData = getImportForFitNotes(file.bytes, { defaultWeightUnit });
            break;
          case 'StrongLifts':
            backupData = getImportForStrongLifts(file.bytes, { defaultWeightUnit });
            break;
          default: {
            const _exhaustive: never = format;
            void _exhaustive;
            throw new Error('Unsupported import format');
          }
        }

        // Content-derived session ids: skip any workout already present so re-importing
        // the same rows is a no-op; new/changed set content still imports.
        const existingSessions = getState().storedSessions.sessions;
        const newWorkouts = backupData.workouts.filter((w) => !existingSessions[w.id]);
        if (newWorkouts.length === 0) {
          dispatch(
            showSnackbar({
              text: tolgee.t('backup.import_from_other_apps.already_imported.message'),
            }),
          );
          return;
        }

        dispatch(
          importBackupData({
            workouts: newWorkouts,
            programs: backupData.programs,
            feed: backupData.feed,
            successMessage: tolgee.t('backup.import_from_other_apps.complete.message', {
              count: newWorkouts.length,
            }),
          }),
        );
        dispatch(setStatsIsDirty(true));
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        logger.warn('External import failed', { err, format });
        dispatch(
          showSnackbar({
            text: tolgee.t('backup.import_from_other_apps.failed.message', { error: message }),
          }),
        );
      }
    },
  );
}
