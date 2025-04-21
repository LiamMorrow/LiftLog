import { KeyValueStore } from '@/services/key-value-store';
import { Logger } from '@/services/logger';
import { ProgressRepository } from '@/services/progress-repository';
import { SessionService } from '@/services/session-service';

async function createServicesInternal() {
  const getStateFactory = async () => {
    const { store } = await import('@/store');
    return store.getState;
  };
  const logger = new Logger();
  const keyValueStore = new KeyValueStore();
  const progressRepository = new ProgressRepository(keyValueStore, logger);
  const sessionService = new SessionService(
    progressRepository,
    await getStateFactory(),
  );

  return {
    logger,
    keyValueStore,
    progressRepository,
    sessionService,
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
