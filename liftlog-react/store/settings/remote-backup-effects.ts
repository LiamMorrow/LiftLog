import { google, LiftLog } from '@/gen/proto';
import {
  toFeedStateDao,
  toProgramBlueprintDao,
  toSessionDao,
} from '@/models/storage/conversions.to-dao';
import { RemoteData } from '@/models/remote';
import { addEffect } from '@/store/listenerMiddleware';
import { selectAllPrograms } from '@/store/program';
import {
  executeRemoteBackup,
  remoteBackupSucceeded,
  setLastBackup,
  setRemoteBackupSettings,
} from '@/store/settings';
import { showSnackbar } from '@/store/app';
import { streamToUint8Array } from '@/utils/stream';
import { toUrlSafeHexString } from '@/utils/to-url-safe-hex-string';
import { Instant } from '@js-joda/core';
import 'compression-streams-polyfill';
import { tolgee } from '@/services/tolgee';

export function addRemoteBackupEffects() {
  addEffect(
    executeRemoteBackup,
    async (
      { payload: { settings, force } },
      {
        getState,
        dispatch,
        extra: { progressRepository, logger, encryptionService },
      },
    ) => {
      settings ??= getState().settings.remoteBackupSettings;
      const { endpoint, apiKey, includeFeedAccount } = settings;

      if (!endpoint?.trim()) {
        return;
      }

      try {
        // Generate data export
        const sessions = progressRepository.getOrderedSessions().toArray();
        const savedPrograms = selectAllPrograms(getState());
        const savedProgramsDao = Object.fromEntries(
          savedPrograms.map(({ id, program }) => [
            id,
            toProgramBlueprintDao(program),
          ]),
        );
        const activeProgramId = getState().program.activeProgramId;
        const feedStateDao = includeFeedAccount
          ? toFeedStateDao(getState().feed)
          : null;

        const dao = new LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2({
          sessions: sessions.map(toSessionDao),
          activeProgramId: new google.protobuf.StringValue({
            value: activeProgramId,
          }),
          feedState: feedStateDao,
          savedPrograms: savedProgramsDao,
        });

        // Serialize and compress data
        const daoBytes =
          LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2.encode(
            dao,
          ).finish();

        const stream = new CompressionStream('gzip');
        const writer = stream.writable.getWriter();
        await writer.write(daoBytes);
        await writer.close();
        const readable = stream.readable as ReadableStream<Uint8Array>;
        const compressedBytes = await streamToUint8Array(readable);

        // Calculate hash
        const hash = await encryptionService.sha256(daoBytes);
        const hashString = toUrlSafeHexString(hash);

        // Check if backup is needed (unless forced)
        const currentState = getState().settings;
        const lastBackupData = currentState.lastBackup.match({
          success: (data) => data,
          error: () => null,
          loading: () => null,
          notAsked: () => null,
        });

        if (
          !force &&
          lastBackupData?.lastSuccessfulRemoteBackupHash === hashString
        ) {
          return;
        }

        // Prepare HTTP request
        const headers: Record<string, string> = {
          'Content-Type': 'application/octet-stream',
        };

        if (apiKey?.trim()) {
          headers['X-Api-Key'] = apiKey;
        }

        // Send backup request
        const response = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: compressedBytes,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Update state on success
        const now = Instant.now();
        dispatch(
          setLastBackup(
            RemoteData.success({
              lastSuccessfulRemoteBackupHash: hashString,
              lastBackupTime: now,
              settings,
            }),
          ),
        );
        if (force) {
          dispatch(
            showSnackbar({
              text: 'Success!',
              action: tolgee.t('Save'),
              dispatchAction: setRemoteBackupSettings(settings),
            }),
          );
        }
        dispatch(remoteBackupSucceeded());

        logger.info('Remote backup completed successfully' + hashString);
      } catch (error) {
        logger.warn('Failed to backup data to remote server', error);

        let errorMessage = 'Failed to backup to remote';
        if (error instanceof Error) {
          if (error.message.includes('fetch')) {
            errorMessage += ' [connection failure]';
          } else if (error.message.includes('HTTP')) {
            const statusMatch = error.message.match(/HTTP (\d+)/);
            if (statusMatch) {
              errorMessage += ` [${statusMatch[1]}]`;
            } else {
              errorMessage += ' [HTTP error]';
            }
          } else {
            errorMessage += ' [unknown]';
          }
        } else {
          errorMessage += ' [unknown]';
        }

        dispatch(showSnackbar({ text: errorMessage }));

        // Update state to indicate failure
        dispatch(setLastBackup(RemoteData.error(errorMessage)));
      }
    },
  );
}
