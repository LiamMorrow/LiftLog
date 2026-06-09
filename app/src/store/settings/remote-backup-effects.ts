import { RemoteData } from '@/models/remote';
import { AddEffectFn } from '@/store/store';
import {
  executeRemoteBackup,
  remoteBackupSucceeded,
  setLastBackup,
  setRemoteBackupSettings,
} from '@/store/settings';
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
      { payload: { settings, force } },
      {
        getState,
        dispatch,
        extra: { logger, encryptionService, tolgee, expoDb },
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
          body: daoBytes,
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
