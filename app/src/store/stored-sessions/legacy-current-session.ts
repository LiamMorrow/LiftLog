import { LiftLog } from '@/gen/proto';
import { Session } from '@/models/session-models';
import { ProtobufToJsonV1Migrator } from '@/models/storage/versions/initial/protobuf-migrator';
import { fromJsonString, JsonString } from '@/models/storage/versions/latest';
import { AnyVersionSessionJSON } from '@/models/storage/versions/any';
import { sessionMigrations } from '@/models/storage/versions/migrations/session';
import { KeyValueStore } from '@/services/key-value-store';
import { Logger } from '@/services/logger';
import { copyLogs, showSnackbar } from '@/store/app';
import { selectPreferredWeightUnit } from '@/store/settings';
import { putStoredSession, setActiveSessionId } from '@/store/stored-sessions';
import { AppDispatch, RootState } from '@/store/store';

/**
 * Before the session table owned the in-progress workout, it lived in its own key-value file. This
 * lifts whatever is still there into the table and then removes the keys, so it runs at most once per
 * install. Delete once no supported version can still be carrying one.
 */
const storageKey = 'CurrentSessionStateV1';

export async function migrateLegacyCurrentSession(
  dispatch: AppDispatch,
  getState: () => RootState,
  keyValueStore: KeyValueStore,
  logger: Logger,
) {
  try {
    const version = await keyValueStore.getItem(`${storageKey}-Version`);
    const hasPayload = (await keyValueStore.getItem(storageKey)) !== null;
    if (version === null && !hasPayload) {
      return;
    }

    // Only v2 ever left the version key unwritten.
    const sessions = version === '3' ? await readV3Json(keyValueStore) : await readV2Proto(keyValueStore, getState);

    if (sessions.workoutSession) {
      dispatch(putStoredSession(sessions.workoutSession));
      dispatch(setActiveSessionId(sessions.workoutSession.id));
    }
    // An edit that was open when the app last closed. It shares its id with the row it came from, so
    // storing it preserves the user's work rather than duplicating it.
    if (sessions.historySession) {
      dispatch(putStoredSession(sessions.historySession));
    }

    await keyValueStore.removeItem(storageKey);
    await keyValueStore.removeItem(`${storageKey}-Version`);
  } catch (e) {
    logger.error('Failed to migrate the legacy current session', e);
    dispatch(
      showSnackbar({
        text: 'Failed to load current session. Please submit a bug report with your logs in settings!',
        action: 'Copy logs',
        dispatchAction: copyLogs(),
      }),
    );
  }
}

async function readV2Proto(keyValueStore: KeyValueStore, getState: () => RootState) {
  const bytes = (await keyValueStore.getItemBytes(storageKey)) ?? Uint8Array.from([]);
  const dao = LiftLog.Ui.Models.CurrentSessionStateDao.CurrentSessionStateDaoV2.decode(bytes);
  const preferredWeightUnit = selectPreferredWeightUnit(getState());
  const restore = (session: typeof dao.workoutSession) =>
    session
      ? Session.fromJSON(sessionMigrations.migrate(ProtobufToJsonV1Migrator.migrateSession(session))).withNoNilWeights(
          preferredWeightUnit,
        )
      : undefined;

  return {
    workoutSession: restore(dao.workoutSession),
    historySession: restore(dao.historySession),
  };
}

async function readV3Json(keyValueStore: KeyValueStore) {
  const json = (await keyValueStore.getItem(storageKey)) ?? 'null';
  const payload = fromJsonString(json as JsonString<AnyVersionSessionJSON | null>);

  return {
    workoutSession: payload ? Session.fromJSON(sessionMigrations.migrate(payload)) : undefined,
    historySession: undefined,
  };
}
