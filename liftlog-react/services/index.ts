import { EncryptionService } from '@/services/encryption-service';
import { FeedApiService } from '@/services/feed-api';
import { FeedFollowService } from '@/services/feed-follow-service';
import { FeedIdentityService } from '@/services/feed-identity-service';
import { FeedInboxDecryptionService } from '@/services/feed-inbox-decryption-service';
import { FileExportService } from '@/services/file-export-service';
import { FilePickerService } from '@/services/file-picker-service';
import { KeyValueStore } from '@/services/key-value-store';
import { Logger } from '@/services/logger';
import { NotificationService } from '@/services/notification-service';
import { PreferenceService } from '@/services/preference-service';
import { ProgressRepository } from '@/services/progress-repository';
import { SessionService } from '@/services/session-service';
import { StringSharer } from '@/services/string-sharer';

async function createServicesInternal() {
  const { store } = await import('@/store');
  const logger = new Logger();
  const keyValueStore = new KeyValueStore();
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
  const feedInboxDecryptionService = new FeedInboxDecryptionService(
    encryptionService,
    feedApiService,
  );
  const feedFollowService = new FeedFollowService(
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
    feedFollowService,
    feedInboxDecryptionService,
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
