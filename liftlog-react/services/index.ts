import { KeyValueStore } from '@/services/key-value-store';
import { Logger } from '@/services/logger';
import { ProgressRepository } from '@/services/progress-repository';
import { SessionService } from '@/services/session-service';

async function createServices() {
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

  const services = {
    logger,
    keyValueStore,
    progressRepository,
    sessionService,
  };
  return services;
}

export type Services = Awaited<ReturnType<typeof createServices>>;

export default createServices;
