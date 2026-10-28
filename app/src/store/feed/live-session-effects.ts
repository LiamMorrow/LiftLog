import { AddEffectFn, RootState } from '@/store/store';
import { selectFeedIdentityRemote, selectSharingLive, setIdentity } from '@/store/feed';
import { encryptLiveSessionAsync } from '@/store/feed/feed-items-effects';
import { enqueueLivePublish } from '@/store/feed/live-publish-queue';
import { activeSessionUpdated } from '@/store/workout-worker';
import {
  deleteStoredSession,
  selectActiveSession,
  selectActiveSessionId,
  sessionFinished,
} from '@/store/stored-sessions';
import { EncryptionService } from '@/services/encryption-service';
import { FeedHubService } from '@/services/feed-hub-service';

/** Logging a set touches the session several times in a row, which friends should see as one update. */
export const LIVE_PUBLISH_COALESCE_MS = 2_000;

let publishedSessionId: string | undefined;

export function addLiveSessionEffects(addEffect: AddEffectFn) {
  addEffect(activeSessionUpdated, async (action, { getState, signal, cancelActiveListeners, extra }) => {
    cancelActiveListeners();
    if (!action.payload.after) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, LIVE_PUBLISH_COALESCE_MS));
    if (signal.aborted) {
      return;
    }
    await publishActiveSessionLive(getState, extra);
  });

  addEffect(sessionFinished, (action) => {
    if (action.payload === publishedSessionId) {
      publishedSessionId = undefined;
    }
  });

  addEffect(deleteStoredSession, async (action, { getState, stateBeforeReduce, extra: { feedHubService } }) => {
    const wasLive =
      action.payload === publishedSessionId ||
      (selectSharingLive(getState()) && action.payload === selectActiveSessionId(stateBeforeReduce));
    if (wasLive) {
      await withdraw(action.payload, feedHubService);
    }
  });

  addEffect(setIdentity, async (_, { getState, stateBeforeReduce, extra }) => {
    const wasSharing = selectSharingLive(stateBeforeReduce);
    const isSharing = selectSharingLive(getState());
    if (wasSharing && !isSharing && publishedSessionId) {
      await withdraw(publishedSessionId, extra.feedHubService);
    } else if (!wasSharing && isSharing) {
      await publishActiveSessionLive(getState, extra);
    }
  });
}

/** Only while the workout screen holds the trainer lease. Coming back to it publishes the workout again. */
export async function publishActiveSessionLive(
  getState: () => RootState,
  { encryptionService, feedHubService }: { encryptionService: EncryptionService; feedHubService: FeedHubService },
) {
  const identity = selectFeedIdentityRemote(getState()).unwrapOr(undefined);
  const session = selectActiveSession(getState());
  if (!identity?.sharesLiveWorkouts || !session || !feedHubService.hasLease('trainer')) {
    return;
  }
  publishedSessionId = session.id;
  await enqueueLivePublish(async () =>
    feedHubService.publishLive(session.id, await encryptLiveSessionAsync(identity, session, encryptionService)),
  );
}

async function withdraw(sessionId: string, feedHubService: FeedHubService) {
  if (sessionId === publishedSessionId) {
    publishedSessionId = undefined;
  }
  await enqueueLivePublish(() => feedHubService.endLive(sessionId));
}
