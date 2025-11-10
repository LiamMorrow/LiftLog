import { google, LiftLog } from '@/gen/proto';
import {
  toFeedStateDao,
  toProgramBlueprintDao,
  toSessionDao,
} from '@/models/storage/conversions.to-dao';
import { addEffect } from '@/store/store';
import { selectAllPrograms } from '@/store/program';
import { exportData } from '@/store/settings';
import { streamToUint8Array } from '@/utils/stream';
import 'compression-streams-polyfill';

export function addExportBackupEffects() {
  addEffect(
    exportData,
    async (
      { payload: { includeFeed } },
      { getState, extra: { progressRepository, fileExportService } },
    ) => {
      const sessions = progressRepository.getOrderedSessions().toArray();
      const savedPrograms = selectAllPrograms(getState());
      const savedProgramsDao = Object.fromEntries(
        savedPrograms.map(({ id, program }) => [
          id,
          toProgramBlueprintDao(program),
        ]),
      );
      const activeProgramId = getState().program.activeProgramId;
      const feedStateDao = includeFeed ? toFeedStateDao(getState().feed) : null;

      const dao = new LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2({
        sessions: sessions.map(toSessionDao),
        activeProgramId: new google.protobuf.StringValue({
          value: activeProgramId,
        }),
        feedState: feedStateDao,
        savedPrograms: savedProgramsDao,
      });
      const daoBytes =
        LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2.encode(
          dao,
        ).finish();
      const stream = new CompressionStream('gzip');
      const writer = stream.writable.getWriter();
      // Don't await this until we start reading
      const writePromise = writer.write(daoBytes);
      const readable = stream.readable;
      const gzippedPromise = streamToUint8Array(readable);

      await writePromise;
      await writer.close();

      await fileExportService.exportBytes(
        'export.liftlogbackup.gz',
        await gzippedPromise,
        'application/octet-stream',
      );
    },
  );
}
