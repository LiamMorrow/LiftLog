import { EncryptionService } from '@/services/encryption-service';
import { FeedApiService } from '@/services/feed-api';
import { FeedIdentityService } from '@/services/feed-identity-service';
import { FileExportService } from '@/services/file-export-service';
import { FilePickerService } from '@/services/file-picker-service';
import { IKeyValueStore } from '@/services/key-value-store';
import { Logger } from '@/services/logger';
import { NotificationService } from '@/services/notification-service';
import { PreferenceService } from '@/services/preference-service';
import { ProgressRepository } from '@/services/progress-repository';
import { SessionService } from '@/services/session-service';
import { StringSharer } from '@/services/string-sharer';
import { Platform } from 'react-native';

async function createServicesInternal() {
  const { store } = await import('@/store');
  const logger = new Logger();
  const keyValueStore: IKeyValueStore =
    Platform.OS === 'web'
      ? new (
          await import('./local-storage-key-value-store')
        ).FileKeyValueStore()
      : new (await import('./file-key-value-store')).KeyValueStore();
  const progressRepository = new ProgressRepository(store.getState);
  const sessionService = new SessionService(progressRepository, store.getState);
  const notificationService = new NotificationService(
    store.getState,
    store.dispatch,
  );
  const encryptionService = new EncryptionService();
  const feedApiService = new FeedApiService();
  const feedIdentityService = new FeedIdentityService(
    feedApiService,
    encryptionService,
  );
  const stringSharer = new StringSharer();
  const fileExportService = new FileExportService();
  const filePickerService = new FilePickerService();
  const preferenceService = new PreferenceService(keyValueStore);

  return {
    logger,
    keyValueStore,
    progressRepository,
    sessionService,
    notificationService,
    encryptionService,
    feedApiService,
    feedIdentityService,
    stringSharer,
    fileExportService,
    filePickerService,
    preferenceService,
  };
}
export type Services = Awaited<ReturnType<typeof createServicesInternal>>;

// Cache the created services so they only get made once
let createdServices: Promise<Services> | undefined;
async function resolveServices(): Promise<Services> {
  createdServices ??= createServicesInternal();
  return await createdServices;
}

export { resolveServices };
