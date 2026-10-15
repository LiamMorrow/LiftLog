import { LiftLog } from '@/gen/proto';
import { Logger } from '@/services/logger';
import { showSnackbar } from '@/store/app';
import { AddEffectFn } from '@/store/store';
import { upsertSavedPlans } from '@/store/program';
import {
  beginFeedImport,
  importBackupData,
  importData,
  importDataProto,
  importDataSql,
  selectPreferredWeightUnit,
} from '@/store/settings';
import { upsertExercises, upsertStoredSessions } from '@/store/stored-sessions';
import { streamToUint8Array, writeInChunks } from '@/utils/stream';
import { sleep } from '@/utils/sleep';
import { Session } from '@/models/session-models';
import { ProgramBlueprint } from '@/models/blueprint-models';
import { ProtobufToJsonV1Migrator } from '@/models/storage/versions/initial/protobuf-migrator';
import { FeedIdentity, Friend, SessionUserEvent } from '@/models/feed-models';
import { deserializeDatabaseAsync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { DatabaseMigrationService } from '@/services/database-migration-service';
import { FeedBackupData } from '@/models/backup';
import { exercisesSchema, feedIdentitySchema, feedItemsSchema, programsSchema } from '@/db/schema';
import { readFriends } from '@/db/feed-friends';
import { mergeLegacyRelationships } from '@/models/storage/versions/migrations/steps/merge-legacy-relationships';
import { readSessions } from '@/db/sessions';
import { toRecord } from '@/utils/reduce';
import {
  feedIdentityMigrations,
  sessionUserEventMigrations,
  exerciseDescriptorMigrations,
  friendMigrations,
  programBlueprintMigrations,
  sessionMigrations,
} from '@/models/storage/versions/migrations';
import { fromExerciseDescriptorJSON } from '@/models/exercise-models';

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

  addEffect(importBackupData, async ({ payload }, { dispatch, getState }) => {
    const { workouts, programs, exercises, feed, successMessage } = payload;
    const preferredWeightUnit = selectPreferredWeightUnit(getState());
    dispatch(upsertStoredSessions(workouts.map((x) => x.withNoNilWeights(preferredWeightUnit))));
    dispatch(upsertSavedPlans(programs));
    if (exercises) {
      dispatch(upsertExercises(exercises));
    }
    dispatch(
      showSnackbar({
        text: successMessage,
      }),
    );
    if (feed) {
      dispatch(beginFeedImport(feed));
    }
  });

  addEffect(importDataSql, async (action, { dispatch, extra: { logger, tolgee } }) => {
    try {
      const {
        payload: { db: backupDb },
      } = action;
      const drizzleBackupDb = drizzle(backupDb);
      const migrator = new DatabaseMigrationService(drizzleBackupDb, logger, {
        importOldData: async () => {},
      });

      await migrator.migrate();
      const workouts = readSessions(drizzleBackupDb).sessions;
      const programs = (await drizzleBackupDb.select().from(programsSchema)).reduce(
        toRecord(
          (x) => x.id,
          (x) => ProgramBlueprint.fromJSON(programBlueprintMigrations.migrate(x.payload)),
        ),
        {},
      );
      const exercises = (await drizzleBackupDb.select().from(exercisesSchema)).reduce(
        toRecord(
          (x) => x.id,
          (x) => fromExerciseDescriptorJSON(exerciseDescriptorMigrations.migrate(x.payload)),
        ),
        {},
      );
      const feedIdentityDb = (await drizzleBackupDb.select().from(feedIdentitySchema)).at(0);

      let feed: FeedBackupData | undefined;
      if (feedIdentityDb) {
        feed = {
          identity: FeedIdentity.fromJSON(feedIdentityMigrations.migrate(feedIdentityDb.payload)),
          feedItems: (await drizzleBackupDb.select().from(feedItemsSchema)).map((x) =>
            SessionUserEvent.fromJSON(sessionUserEventMigrations.migrate(x.payload)),
          ),
          friends: readFriends(drizzleBackupDb),
        };
      }

      dispatch(
        importBackupData({
          programs,
          exercises,
          workouts,
          feed,
          successMessage: tolgee.t('Restore complete!'),
        }),
      );
    } finally {
      await action.payload.db.closeAsync();
    }
  });

  addEffect(importDataProto, async ({ payload: { dao } }, { dispatch, extra: { tolgee } }) => {
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
      const identity = FeedIdentity.fromJSON(
        feedIdentityMigrations.migrate(ProtobufToJsonV1Migrator.migrateFeedIdentity(dao.feedState.identity)),
      );
      feed = {
        identity,
        feedItems: (dao.feedState.feedItems ?? []).map((x) =>
          SessionUserEvent.fromJSON(
            sessionUserEventMigrations.migrate(ProtobufToJsonV1Migrator.migrateSessionUserEvent(x)),
          ),
        ),
        friends: mergeLegacyRelationships({
          ownId: identity.id,
          followed: (dao.feedState.followedUsers ?? []).map((x) => ProtobufToJsonV1Migrator.migrateFollowedUser(x)),
          pending: [],
          followers: (dao.feedState.followers ?? []).map((x) => ProtobufToJsonV1Migrator.migrateFollowerUser(x)),
        }).friends.map((x) => Friend.fromJSON(friendMigrations.migrate(x))),
      };
    }
    dispatch(
      importBackupData({
        workouts,
        programs,
        feed,
        successMessage: tolgee.t('Restore complete!'),
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

    // Start reading from the stream immediately
    const decompressPromise = streamToUint8Array(stream.readable);
    await writeInChunks(writer, bytes);
    await writer.close();
    const gunzipped = await decompressPromise;
    return gunzipped;
  } catch (e) {
    logger.warn('Could not unzip bytes', e);
    return bytes;
  }
}
