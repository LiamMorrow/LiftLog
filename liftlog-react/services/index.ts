import { KeyValueStore } from '@/services/key-value-store';
import { Logger } from '@/services/logger';
import { NotificationService } from '@/services/notification-service';
import { ProgressRepository } from '@/services/progress-repository';
import { SessionService } from '@/services/session-service';

async function createServicesInternal() {
  const { store } = await import('@/store');
  const logger = new Logger();
  const keyValueStore = new KeyValueStore();
  const progressRepository = new ProgressRepository(keyValueStore, logger);
  const sessionService = new SessionService(progressRepository, store.getState);
  const notificationService = new NotificationService(
    store.getState,
    store.dispatch,
  );

  return {
    logger,
    keyValueStore,
    progressRepository,
    sessionService,
    notificationService,
  };
}
export type Services = Awaited<ReturnType<typeof createServicesInternal>>;

// Cache the created services so they only get made once
let createdServices: Promise<Services> | undefined;
async function createServices(): Promise<Services> {
  createdServices ??= createServicesInternal();
  return await createdServices;
}

export { createServices };
