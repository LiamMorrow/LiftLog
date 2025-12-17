import { google, LiftLog } from '@/gen/proto';
import {
  toFeedStateDao,
  toProgramBlueprintDao,
  toSessionDao,
} from '@/models/storage/conversions.to-dao';
import { RemoteData } from '@/models/remote';
import { addEffect } from '@/store/store';
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
import { TaskAbortError } from '@reduxjs/toolkit';

// Helper function to yield control back to the event loop
const yieldToEventLoop = () =>
  new Promise((resolve) => setTimeout(resolve, 20));

// Process data in chunks to avoid blocking the main thread
async function processInChunks<T, R>(
  items: T[],
  processor: (item: T) => R,
  chunkSize: number = 100,
  throwIfCancelled: () => void,
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += chunkSize) {
    throwIfCancelled();

    const chunk = items.slice(i, i + chunkSize);
    const chunkResults = chunk.map(processor);
    results.push(...chunkResults);

    // Yield control back to the event loop after each chunk
    if (i + chunkSize < items.length) {
      await yieldToEventLoop();
    }
  }

  return results;
}

export function addRemoteBackupEffects() {
  addEffect(
    executeRemoteBackup,
    async (
      { payload: { settings, force } },
      {
        getState,
        dispatch,
        extra: { progressRepository, logger, encryptionService, tolgee },
        signal,
        cancelActiveListeners,
        throwIfCancelled,
      },
    ) => {
      cancelActiveListeners();
      const start = performance.now();
      settings ??= getState().settings.remoteBackupSettings;
      const { endpoint, apiKey, includeFeedAccount } = settings;

      if (!endpoint?.trim()) {
        return;
      }

      try {
        throwIfCancelled();

        // Generate data export with chunked processing
        const sessions = progressRepository.getOrderedSessions();
        throwIfCancelled();

        // Process sessions in chunks to avoid blocking
        const processedSessions = await processInChunks(
          sessions.toArray(),
          toSessionDao,
          50,
          throwIfCancelled,
        );

        throwIfCancelled();
        const savedPrograms = selectAllPrograms(getState());

        // Process saved programs in chunks
        const savedProgramEntries = Object.entries(savedPrograms);
        const processedPrograms = await processInChunks(
          savedProgramEntries,
          ([id, { program }]) => [id, toProgramBlueprintDao(program)] as const,
          20, // Process 20 programs at a time
          throwIfCancelled,
        );

        const savedProgramsDao = Object.fromEntries(processedPrograms);

        throwIfCancelled();
        const activeProgramId = getState().program.activeProgramId;
        const feedStateDao = includeFeedAccount
          ? toFeedStateDao(getState().feed)
          : null;

        throwIfCancelled();
        const dao = new LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2({
          sessions: processedSessions,
          activeProgramId: new google.protobuf.StringValue({
            value: activeProgramId,
          }),
          feedState: feedStateDao,
          savedPrograms: savedProgramsDao,
        });

        // Yield before expensive serialization
        await yieldToEventLoop();
        throwIfCancelled();

        // Serialize and compress data
        const daoBytes =
          LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2.encode(
            dao,
          ).finish();

        throwIfCancelled();

        // Compression with abort signal monitoring
        const stream = new CompressionStream('gzip');
        const writer = stream.writable.getWriter();

        // Check abort signal before writing
        throwIfCancelled();
        await writer.write(daoBytes);
        await writer.close();

        throwIfCancelled();
        const readable = stream.readable;
        const compressedBytes = await streamToUint8Array(readable);

        throwIfCancelled();

        // Calculate hash (CPU intensive)
        const hash = await encryptionService.sha256(daoBytes);
        const hashString = toUrlSafeHexString(hash);

        throwIfCancelled();

        // Check if backup is needed (unless forced)
        const currentState = getState().settings;
        const lastBackupData = currentState.lastBackup.match({
          success: (data) => data,
          error: () => null,
          loading: () => null,
          notAsked: () => null,
        });
        console.log(
          `Calculated Hash ${hashString} in `,
          performance.now() - start,
        );

        if (
          !force &&
          lastBackupData?.lastSuccessfulRemoteBackupHash === hashString
        ) {
          return;
        }

        throwIfCancelled();

        // Prepare HTTP request
        const headers: Record<string, string> = {
          'Content-Type': 'application/octet-stream',
        };

        if (apiKey?.trim()) {
          headers['X-Api-Key'] = apiKey;
        }

        // Send backup request with abort signal
        const response = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: compressedBytes,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        throwIfCancelled();

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
              action: tolgee.t('generic.save.button'),
              dispatchAction: setRemoteBackupSettings(settings),
            }),
          );
        }
        dispatch(remoteBackupSucceeded());

        logger.info('Remote backup completed successfully' + hashString);
      } catch (error) {
        if (error instanceof TaskAbortError) {
          logger.info('Cancelled due to concurrent remote backup');
          return; // Don't show error message for user-initiated cancellation
        }

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
