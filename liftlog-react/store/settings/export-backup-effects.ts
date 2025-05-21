import { google, LiftLog } from '@/gen/proto';
import {
  toFeedStateDao,
  toProgramBlueprintDao,
  toSessionDao,
} from '@/models/storage/conversions.to-dao';
import { addEffect } from '@/store/listenerMiddleware';
import { selectAllPrograms } from '@/store/program';
import { exportData } from '@/store/settings';
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
      await writer.write(daoBytes);
      await writer.close();
      const readable = stream.readable as ReadableStream<Uint8Array>;
      const gzipped = await streamToUint8Array(readable);

      await fileExportService.exportBytes(
        'liftlog.backup.gz',
        gzipped,
        'application/octet-stream',
      );
    },
  );
}
async function streamToUint8Array(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
  const chunks = [];
  let totalLength = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    chunks.push(value);
    totalLength += value.length;
  }

  const result = new Uint8Array(totalLength);
  let position = 0;
  for (const chunk of chunks) {
    result.set(chunk, position);
    position += chunk.length;
  }

  return result;
}
