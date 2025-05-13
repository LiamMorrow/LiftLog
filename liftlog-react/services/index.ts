import { EncryptionService } from '@/services/encryption-service';
import { IKeyValueStore } from '@/services/key-value-store';
import { Logger } from '@/services/logger';
import { NotificationService } from '@/services/notification-service';
import { ProgressRepository } from '@/services/progress-repository';
import { SessionService } from '@/services/session-service';
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

  return {
    logger,
    keyValueStore,
    progressRepository,
    sessionService,
    notificationService,
    encryptionService,
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
