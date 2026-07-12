import { LiftLog } from '@/gen/proto';
import { Logger } from '@/services/logger';
import { showSnackbar } from '@/store/app';
import { AddEffectFn } from '@/store/store';
import { upsertSavedPlans } from '@/store/program';
import { beginFeedImport, importBackupData, importData, importDataProto, importDataSql } from '@/store/settings';
import { upsertStoredSessions } from '@/store/stored-sessions';
import { streamToUint8Array } from '@/utils/stream';
import { sleep } from '@/utils/sleep';
import { Session } from '@/models/session-models';
import { ProgramBlueprint } from '@/models/blueprint-models';
import { ProtobufToJsonV1Migrator } from '@/models/storage/versions/initial/protobuf-migrator';
import {
  FeedIdentity,
  FollowerFeedUser,
  FollowRequestInboxMessage,
  fromFeedUserJSON,
  SessionUserEvent,
} from '@/models/feed-models';
import { deserializeDatabaseAsync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { eq } from 'drizzle-orm';
import { DatabaseMigrationService } from '@/services/database-migration-service';
import { FeedBackupData } from '@/models/backup';
import {
  dataMigrationsSchema,
  feedFollowedUsersSchema,
  feedFollowerUsersSchema,
  feedFollowRequestsSchema,
  feedIdentitySchema,
  feedItemsSchema,
  feedPendingUsersSchema,
  programsSchema,
  sessionsSchema,
} from '@/db/schema';
import { migrateNilWeightUnitsDataMigration } from '@/services/data-migrations/migrate-nil-weight-units';
import { toRecord } from '@/utils/reduce';
import {
  followRequestInboxMessageMigrations,
  feedIdentityMigrations,
  sessionUserEventMigrations,
  followedFeedUserMigrations,
  followerFeedUserMigrations,
  programBlueprintMigrations,
  sessionMigrations,
  pendingFeedUserMigrations,
} from '@/models/storage/versions/migrations';
import { FeedUserJSON } from '@/models/storage/versions/latest';

export function addImportBackupEffects(addEffect: AddEffectFn) {
  addEffect(importData, async (_, { dispatch, extra: { filePickerService, logger, tolgee } }) => {
    const file = await filePickerService.pickFile();
    if (!file) {
      return;
    }
    dispatch(
      showSnackbar({
        text: tolgee.t('Beginning restore'),
      }),
    );
    await sleep(200);
    const gunzipped = await unGzipIfZipped(file.bytes, logger);
    const parsedProto = tryParseProto(gunzipped, logger);
    if (parsedProto) {
      dispatch(importDataProto({ dao: parsedProto }));
      return;
    } else {
      logger.warn('Failed to deserialize data into proto, trying sqlite', {});
    }
    try {
      const db = await deserializeDatabaseAsync(gunzipped);
      dispatch(importDataSql({ db }));
    } catch (err) {
      logger.warn('Failed to deserialize sql', { err });
      dispatch(
        showSnackbar({
          text: 'Could not import data: Unexpected format.',
        }),
      );
    }
  });

  addEffect(
    importBackupData,
    async ({ payload: dao }, { dispatch, extra: { tolgee, db, databaseMigrationService } }) => {
      dispatch(upsertStoredSessions(dao.workouts));
      dispatch(upsertSavedPlans(dao.programs));
      dispatch(
        showSnackbar({
          text: tolgee.t('Restore complete!'),
        }),
      );
      // Let the data migration re-run on next launch so imported nil-unit weights get coalesced
      await db.delete(dataMigrationsSchema).where(eq(dataMigrationsSchema.id, migrateNilWeightUnitsDataMigration));
      await databaseMigrationService.migrate();
      if (dao.feed) {
        dispatch(beginFeedImport(dao.feed));
      }
    },
  );

  addEffect(importDataSql, async (action, { dispatch, extra: { logger } }) => {
    try {
      const {
        payload: { db: backupDb },
      } = action;
      const drizzleBackupDb = drizzle(backupDb);
      const migrator = new DatabaseMigrationService(drizzleBackupDb, logger, {
        importOldData: async () => {},
      });

      await migrator.migrate();
      const workouts = (await drizzleBackupDb.select().from(sessionsSchema)).map((x) => Session.fromJSON(x.payload));
      const programs = (await drizzleBackupDb.select().from(programsSchema)).reduce(
        toRecord(
          (x) => x.id,
          (x) => ProgramBlueprint.fromJSON(x.payload),
        ),
        {},
      );
      const feedIdentityDb = (await drizzleBackupDb.select().from(feedIdentitySchema)).at(0);

      let feed: FeedBackupData | undefined;
      if (feedIdentityDb) {
        feed = {
          identity: FeedIdentity.fromJSON(feedIdentityDb.payload),
          feedItems: (await drizzleBackupDb.select().from(feedItemsSchema)).map((x) =>
            SessionUserEvent.fromJSON(x.payload),
          ),
          followRequests: (await drizzleBackupDb.select().from(feedFollowRequestsSchema)).map((x) =>
            FollowRequestInboxMessage.fromJSON(x.payload),
          ),
          followed: (
            (await drizzleBackupDb.select().from(feedFollowedUsersSchema)) as {
              payload: FeedUserJSON;
            }[]
          )
            .concat(await drizzleBackupDb.select().from(feedPendingUsersSchema))
            .map((x) => fromFeedUserJSON(x.payload)),
          followers: (await drizzleBackupDb.select().from(feedFollowerUsersSchema)).map((x) =>
            FollowerFeedUser.fromJSON(x.payload),
          ),
        };
      }

      dispatch(
        importBackupData({
          programs,
          workouts,
          feed,
        }),
      );
    } finally {
      await action.payload.db.closeAsync();
    }
  });

  addEffect(importDataProto, async ({ payload: { dao } }, { dispatch }) => {
    const workouts = dao.sessions.map((s) =>
      Session.fromJSON(sessionMigrations.migrate(ProtobufToJsonV1Migrator.migrateSession(s))),
    );
    const programs = Object.fromEntries(
      Object.entries(dao.savedPrograms).map(
        ([id, program]) =>
          [
            id,
            ProgramBlueprint.fromJSON(
              programBlueprintMigrations.migrate(ProtobufToJsonV1Migrator.migrateProgramBlueprint(program)),
            ),
          ] as const,
      ),
    );
    let feed: FeedBackupData | undefined;
    if (dao.feedState?.identity) {
      feed = {
        identity: FeedIdentity.fromJSON(
          feedIdentityMigrations.migrate(ProtobufToJsonV1Migrator.migrateFeedIdentity(dao.feedState.identity)),
        ),
        feedItems: (dao.feedState.feedItems ?? []).map((x) =>
          SessionUserEvent.fromJSON(
            sessionUserEventMigrations.migrate(ProtobufToJsonV1Migrator.migrateSessionUserEvent(x)),
          ),
        ),
        followed: (dao.feedState.followedUsers ?? []).map((x) => {
          const json = ProtobufToJsonV1Migrator.migrateFollowedUser(x);
          return fromFeedUserJSON(
            json.type === 'FollowedFeedUser'
              ? followedFeedUserMigrations.migrate(json)
              : pendingFeedUserMigrations.migrate(json),
          );
        }),
        followers: (dao.feedState.followers ?? []).map((x) =>
          FollowerFeedUser.fromJSON(
            followerFeedUserMigrations.migrate(ProtobufToJsonV1Migrator.migrateFollowerUser(x)),
          ),
        ),
        followRequests: (dao.feedState.followRequests ?? []).map((x) =>
          FollowRequestInboxMessage.fromJSON(
            followRequestInboxMessageMigrations.migrate(ProtobufToJsonV1Migrator.migrateFollowRequest(x)),
          ),
        ),
      };
    }
    dispatch(
      importBackupData({
        workouts,
        programs,
        feed,
      }),
    );
  });
}

function tryParseProto(
  bytes: Uint8Array,
  logger: Logger,
): LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2 | undefined {
  try {
    return LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2.decode(bytes);
  } catch (e) {
    logger.warn('Could not parse bytes as proto', e);
    return undefined;
  }
}

async function unGzipIfZipped(bytes: Uint8Array, logger: Logger): Promise<Uint8Array> {
  try {
    const stream = new DecompressionStream('gzip');

    const writer = stream.writable.getWriter();
    const readable = stream.readable;

    // Start reading from the stream immediately
    const decompressPromise = streamToUint8Array(readable);
    const chunkSize = 8192; // 8KB chunks
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.slice(i, i + chunkSize);
      await writer.write(chunk);
    }
    await writer.close();
    const gunzipped = await decompressPromise;
    return gunzipped;
  } catch (e) {
    logger.warn('Could not unzip bytes', e);
    return bytes;
  }
}
