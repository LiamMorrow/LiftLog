import { AiChatService } from '@/services/ai-chat-service';
import { EncryptionService } from '@/services/encryption-service';
import { FeedApiService } from '@/services/feed-api';
import { FeedFollowService } from '@/services/feed-follow-service';
import { FeedIdentityService } from '@/services/feed-identity-service';
import { FeedInboxDecryptionService } from '@/services/feed-inbox-decryption-service';
import { FileExportService } from '@/services/file-export-service';
import { FilePickerService } from '@/services/file-picker-service';
import { HubConnectionFactory } from '@/services/hub-connection-factory';
import { KeyValueStore } from '@/services/key-value-store';
import { Logger } from '@/services/logger';
import { NotificationService } from '@/services/notification-service';
import { PreferenceService } from '@/services/preference-service';
import { ProgressRepository } from '@/services/progress-repository';
import { SessionService } from '@/services/session-service';
import { StringSharer } from '@/services/string-sharer';
import { getTolgee } from '@/services/tolgee';
import { WorkoutWorker } from '@/services/workout-worker';
import { RootState } from '@/store';
import { Store } from '@reduxjs/toolkit';

export type Services = Awaited<ReturnType<typeof resolveServicesInternal>>;

let resolvedServices: Services | undefined;

function resolveServicesInternal(store: Store<RootState>) {
  if (!store) {
    throw new Error('Tried to resolve services without store');
  }
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
  const aiChatService = new AiChatService(
    new HubConnectionFactory(),
    store.getState,
  );
  const tolgee = getTolgee(preferenceService);
  const workoutWorkerService = new WorkoutWorker(
    store.dispatch,
    store.getState,
    tolgee,
  );

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
    aiChatService,
    workoutWorkerService,
    tolgee,
  };
}

function resolveServices(store: Store<RootState>) {
  return (resolvedServices ??= resolveServicesInternal(store));
}

export { resolveServices };
