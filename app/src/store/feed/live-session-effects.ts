import { AddEffectFn } from '@/store/store';
import { selectFeedIdentityRemote, setIdentity } from '@/store/feed';
import { publishLiveSessionAsync, removeLiveSessionAsync } from '@/store/feed/feed-items-effects';
import { enqueueLivePublish } from '@/store/feed/live-publish-queue';
import { activeSessionUpdated } from '@/store/workout-worker';
import {
  deleteStoredSession,
  selectActiveSession,
  selectActiveSessionId,
  sessionFinished,
} from '@/store/stored-sessions';
import { FeedIdentity } from '@/models/feed-models';
import { EncryptionService } from '@/services/encryption-service';
import { FeedApiService } from '@/services/feed-api';

export const LIVE_PUBLISH_INTERVAL_MS = 60 * 1000;

let lastPublishedAtMs = 0;
let publishedSessionId: string | undefined;

export function addLiveSessionEffects(addEffect: AddEffectFn) {
  addEffect(
    activeSessionUpdated,
    async (action, { getState, signal, cancelActiveListeners, extra: { encryptionService, feedApiService } }) => {
      cancelActiveListeners();
      if (!action.payload.after) {
        return;
      }

      const waitMs = lastPublishedAtMs + LIVE_PUBLISH_INTERVAL_MS - Date.now();
      if (waitMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        if (signal.aborted) {
          return;
        }
      }

      const identity = selectFeedIdentityRemote(getState()).unwrapOr(undefined);
      const session = selectActiveSession(getState());
      if (!identity?.publishWorkouts || !session) {
        return;
      }
      lastPublishedAtMs = Date.now();
      publishedSessionId = session.id;
      await enqueueLivePublish(() => publishLiveSessionAsync(identity, session, encryptionService, feedApiService));
    },
  );

  addEffect(sessionFinished, (action) => {
    if (action.payload === publishedSessionId) {
      publishedSessionId = undefined;
    }
  });

  addEffect(
    deleteStoredSession,
    async (action, { getState, stateBeforeReduce, extra: { encryptionService, feedApiService } }) => {
      const identity = selectFeedIdentityRemote(getState()).unwrapOr(undefined);
      const wasLive =
        action.payload === publishedSessionId ||
        (!!identity?.publishWorkouts && action.payload === selectActiveSessionId(stateBeforeReduce));
      if (identity && wasLive) {
        await withdraw(identity, action.payload, encryptionService, feedApiService);
      }
    },
  );

  addEffect(setIdentity, async (action, { extra: { encryptionService, feedApiService } }) => {
    const identity = action.payload.unwrapOr(undefined);
    if (identity && !identity.publishWorkouts && publishedSessionId) {
      await withdraw(identity, publishedSessionId, encryptionService, feedApiService);
    }
  });
}

async function withdraw(
  identity: FeedIdentity,
  sessionId: string,
  encryptionService: EncryptionService,
  feedApiService: FeedApiService,
) {
  if (sessionId === publishedSessionId) {
    publishedSessionId = undefined;
  }
  await enqueueLivePublish(() => removeLiveSessionAsync(identity, sessionId, encryptionService, feedApiService));
}
