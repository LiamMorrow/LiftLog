import { backendHeaderRecord, backupUrl } from '@/models/backend';
import { RemoteData } from '@/models/remote';
import { selectBackendForFeature } from '@/store/backends';
import { AddEffectFn, RootState } from '@/store/store';
import { executeRemoteBackup, remoteBackupSucceeded, setLastBackup } from '@/store/settings';
import { showSnackbar } from '@/store/app';
import { toUrlSafeHexString } from '@/utils/to-url-safe-hex-string';
import { Instant } from '@js-joda/core';
import 'compression-streams-polyfill';
import { TaskAbortError } from '@reduxjs/toolkit';
import { getBackupBytes } from '@/store/settings/util';

export function addRemoteBackupEffects(addEffect: AddEffectFn) {
  addEffect(
    executeRemoteBackup,
    async (
      { payload: { backend, force } },
      {
        getState,
        dispatch,
        extra: { logger, encryptionService, tolgee, expoDb },
        cancelActiveListeners,
        throwIfCancelled,
      },
    ) => {
      cancelActiveListeners();
      const start = performance.now();

      const target = backend
        ? { backend, url: backupUrl(backend), headers: backendHeaderRecord(backend) }
        : resolveBackendTarget(getState());
      if (!target) {
        return;
      }

      const includeFeedAccount = getState().settings.backupIncludeFeedAccount;

      try {
        throwIfCancelled();

        const daoBytes = await getBackupBytes({
          includeFeed: includeFeedAccount,
          expoDb,
        });

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

        const sameBackend = lastBackupData?.backendId === target.backend.id;
        if (!force && sameBackend && lastBackupData?.lastSuccessfulRemoteBackupHash === hashString) {
          return;
        }

        throwIfCancelled();

        const response = await fetch(target.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/octet-stream', ...target.headers },
          body: daoBytes,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        throwIfCancelled();

        dispatch(
          setLastBackup(
            RemoteData.success({
              lastSuccessfulRemoteBackupHash: hashString,
              lastBackupTime: Instant.now(),
              backendId: target.backend.id,
            }),
          ),
        );
        if (force) {
          dispatch(showSnackbar({ text: tolgee.t('backup.sent_successfully.message') }));
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
      logger.log(`executeRemoteBackup took ${(performance.now() - start).toFixed(2)}ms`);
    },
  );
}

function resolveBackendTarget(state: RootState) {
  const resolved = selectBackendForFeature(state, 'backup');
  if (!resolved) {
    return undefined;
  }
  return { backend: resolved.backend, url: backupUrl(resolved.backend), headers: resolved.headers };
}
