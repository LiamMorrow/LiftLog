import { LiftLog } from '@/gen/proto';
import {
  fromProgramBlueprintDao,
  fromSessionBlueprintDao,
  fromSessionDao,
} from '@/models/storage/conversions.from-dao';
import { Logger } from '@/services/logger';
import { showSnackbar } from '@/store/app';
import { addEffect } from '@/store/store';
import {
  createSavedPlan,
  setActivePlan,
  setProgramSessions,
  upsertSavedPlans,
} from '@/store/program';
import { beginFeedImport, importData, importDataDao } from '@/store/settings';
import { upsertStoredSessions } from '@/store/stored-sessions';
import { streamToUint8Array } from '@/utils/stream';
import { uuid } from '@/utils/uuid';
import { LocalDate } from '@js-joda/core';

export function addImportBackupEffects() {
  addEffect(
    importData,
    async (_, { dispatch, extra: { filePickerService, logger } }) => {
      const file = await filePickerService.pickFile();
      if (!file) {
        return;
      }
      const gunzipped = await unGzipIfZipped(file.bytes, logger);
      const parsedProto = tryParseProto(gunzipped, logger);
      if (!parsedProto) {
        // We've dropped support for v1 for now. If people complain - we can bring it back
        // This is also a point we could try to import a csv, it's requested fairly often
        dispatch(
          showSnackbar({
            text: 'Could not import data: Unexpected format.',
          }),
        );
        return;
      }
      dispatch(importDataDao({ dao: parsedProto }));
    },
  );

  addEffect(importDataDao, async ({ payload: { dao } }, { dispatch }) => {
    const sessions = dao.sessions.map(fromSessionDao);
    dispatch(upsertStoredSessions(sessions));
    const programs = Object.fromEntries(
      Object.entries(dao.savedPrograms).map(
        ([id, program]) => [id, fromProgramBlueprintDao(program)] as const,
      ),
    );
    dispatch(upsertSavedPlans(programs));
    // Will be null when an old export which did not have an active program is imported
    // In this case, it will have an unnamed program, which will be set as the active program
    if (!dao.activeProgramId?.value) {
      const newId = uuid();
      dispatch(
        createSavedPlan({
          name: 'My Program',
          programId: newId,
          time: LocalDate.now(),
        }),
      );
      dispatch(
        setProgramSessions({
          programId: newId,
          sessionBlueprints: dao.program.map(fromSessionBlueprintDao),
        }),
      );
      dispatch(setActivePlan({ programId: newId }));
    } else {
      if (dao.activeProgramId.value in programs) {
        dispatch(setActivePlan({ programId: dao.activeProgramId.value }));
      }
    }
    if (dao.feedState) {
      dispatch(beginFeedImport(dao.feedState));
    }
  });
}

function tryParseProto(
  bytes: Uint8Array,
  logger: Logger,
): LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2 | undefined {
  try {
    return LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2.decode(bytes);
  } catch (e) {
    logger.warn('Could not parse bytes as proto', e);
    return undefined;
  }
}

async function unGzipIfZipped(
  bytes: Uint8Array,
  logger: Logger,
): Promise<Uint8Array> {
  try {
    const stream = new DecompressionStream('gzip');
    const writer = stream.writable.getWriter();
    await writer.write(bytes);
    await writer.close();
    const readable = stream.readable;
    const gunzipped = await streamToUint8Array(readable);
    return gunzipped;
  } catch (e) {
    logger.warn('Could not unzip bytes', e);
    return bytes;
  }
}
