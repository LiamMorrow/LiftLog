import { addEffect } from '@/store/listenerMiddleware';
import {
  addStoredSession,
  deleteStoredSession,
  initializeStoredSessionsStateSlice,
  setIsHydrated,
  setStoredSessions,
} from './index';
import { LiftLog } from '@/gen/proto';
import { match } from 'ts-pattern';
import { fromSessionDao } from '@/models/storage/conversions.from-dao';
import { toSessionHistoryDao } from '@/models/storage/conversions.to-dao';
import { fetchUpcomingSessions } from '@/store/program';

const storageKey = 'Progress';

export function applyStoredSessionsEffects() {
  addEffect(
    initializeStoredSessionsStateSlice,
    async (
      _,
      { cancelActiveListeners, dispatch, extra: { keyValueStore } },
    ) => {
      cancelActiveListeners();
      let version = await keyValueStore.getItem(`${storageKey}-Version`);
      if (!version) {
        version = '2';
        await keyValueStore.setItem(`${storageKey}-Version`, '2');
      }

      const storedData = await match(version)
        .with('2', async () =>
          LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2.decode(
            (await keyValueStore.getItemBytes(storageKey)) ??
              Uint8Array.from([]),
          ),
        )
        .otherwise((x) => {
          throw new Error(`Unsupported version ${x}`);
        });

      const map = Object.fromEntries(
        storedData?.completedSessions
          .map(fromSessionDao)
          .map((x) => [x.id, x.toPOJO()]) ?? [],
      );
      dispatch(setStoredSessions(map));

      dispatch(setIsHydrated(true));
      dispatch(fetchUpcomingSessions());
    },
  );

  addEffect(
    [deleteStoredSession, addStoredSession],
    async (
      _,
      { cancelActiveListeners, getState, extra: { keyValueStore } },
    ) => {
      cancelActiveListeners();
      const s = LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2.encode(
        toSessionHistoryDao(getState().storedSessions.sessions),
      );
      await Promise.all([
        keyValueStore.setItem(`${storageKey}-Version`, '2'),
        keyValueStore.setItem(storageKey, s.finish()),
      ]);
    },
  );
}
