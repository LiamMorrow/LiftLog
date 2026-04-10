import { google, LiftLog } from '@/gen/proto';
import { addEffect } from '@/store/store';
import { selectAllPrograms } from '@/store/program';
import { exportData } from '@/store/settings';
import { streamToUint8Array } from '@/utils/stream';
import 'compression-streams-polyfill';
import { toFeedStateDao } from '../feed';
import { DateTimeFormatter, LocalDateTime } from '@js-joda/core';

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
        savedPrograms.map(({ id, program }) => [id, program.toDao()]),
      );
      const activeProgramId = getState().program.activePlanId;
      const feedStateDao = includeFeed ? toFeedStateDao(getState().feed) : null;

      const dao = new LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2({
        sessions: sessions.map((x) => x.toDao()),
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
      const now = LocalDateTime.now()
        .withNano(0)
        .format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
        .replaceAll(':', '')
        .replaceAll('T', '_')
        .replaceAll('-', '');

      await fileExportService.exportBytes(
        `export.liftlogbackup.${now}.gz`,
        await gzippedPromise,
        'application/octet-stream',
      );
    },
  );
}
