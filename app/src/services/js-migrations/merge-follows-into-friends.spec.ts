import migrations from '@/drizzle/migrations';
import { feedFriendsSchema, feedRevokedFollowSecretsSchema } from '@/db/schema';
import { Friend } from '@/models/feed-models';
import { friendMigrations } from '@/models/storage/versions/migrations';
import { migrateDatabase, type MigrationBundle } from '@/services/database-migration-service';
import { jsMigrations } from '@/services/js-migrations';
import { sql } from 'drizzle-orm';
import { drizzle, type ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { openDatabaseAsync } from 'expo-sqlite';
import { describe, expect, it } from 'vitest';

const before0013: MigrationBundle = {
  ...migrations,
  journal: {
    ...migrations.journal,
    entries: migrations.journal.entries.filter((x) => x.tag < '0013_feed_friend'),
  },
};

const OWN_ID = 'me';
const publicKey = (id: string) => ({ spkiPublicKeyBytes: Buffer.from(`key-${id}`).toString('base64') });
const aesKey = (id: string) => ({ value: Buffer.from(`aes-${id}`).toString('base64') });

function followed(id: string) {
  return {
    version: 3,
    type: 'FollowedFeedUser',
    id,
    publicKey: publicKey(id),
    name: `followed ${id}`,
    currentPlan: undefined,
    aesKey: aesKey(id),
    followSecret: `their-secret-${id}`,
  };
}

function pending(id: string) {
  return { type: 'PendingFeedUser', id, publicKey: publicKey(id), name: `pending ${id}` };
}

function follower(id: string) {
  return {
    type: 'FollowerFeedUser',
    id,
    publicKey: publicKey(id),
    name: `follower ${id}`,
    followSecret: `my-secret-${id}`,
  };
}

async function migrateLegacy(rows: {
  followed?: object[];
  pending?: object[];
  followers?: object[];
  identity?: boolean;
}): Promise<ExpoSQLiteDatabase> {
  const db = drizzle(await openDatabaseAsync(':memory:'));
  await migrateDatabase(db, before0013, []);
  const insert = (table: string, payloads: object[] = []) => {
    for (const payload of payloads) {
      const id = (payload as { id: string }).id;
      db.run(sql`INSERT INTO ${sql.identifier(table)} (id, payload) VALUES (${id}, ${JSON.stringify(payload)})`);
    }
  };
  insert('feed_followed_user', rows.followed);
  insert('feed_pending_user', rows.pending);
  insert('feed_follower_user', rows.followers);
  if (rows.identity !== false) {
    db.run(sql`INSERT INTO feed_identity (id, payload) VALUES (0, ${JSON.stringify({ id: OWN_ID })})`);
  }
  await migrateDatabase(db, migrations, jsMigrations);
  return db;
}

function friends(db: ExpoSQLiteDatabase) {
  return Object.fromEntries(
    db
      .select()
      .from(feedFriendsSchema)
      .all()
      .map((row) => {
        const friend = Friend.fromJSON(friendMigrations.migrate(row.payload));
        return [friend.id, friend];
      }),
  );
}

describe('MERGE_FOLLOWS_INTO_FRIENDS', () => {
  it('makes a mutual follow a friend, keeping both secrets and their key', async () => {
    const db = await migrateLegacy({ followed: [followed('alice')], followers: [follower('alice')] });

    const alice = friends(db).alice!;
    expect(alice.status).toBe('friend');
    expect(alice.name).toBe('followed alice');
    expect(alice.theirSecret).toBe('their-secret-alice');
    expect(alice.mySecret).toBe('my-secret-alice');
    expect(alice.theirKeys.map((x) => Buffer.from(x.value).toString())).toEqual(['aes-alice']);
    expect(Buffer.from(alice.publicKey.spkiPublicKeyBytes).toString()).toBe('key-alice');
  });

  it('keeps someone we followed one-way as a legacy following', async () => {
    const db = await migrateLegacy({ followed: [followed('bob')] });

    const bob = friends(db).bob!;
    expect(bob.status).toBe('legacyFollowing');
    expect(bob.theirSecret).toBe('their-secret-bob');
    expect(bob.mySecret).toBeUndefined();
    expect(bob.theirKeys).toHaveLength(1);
  });

  it('keeps someone who followed us one-way as a legacy follower', async () => {
    const db = await migrateLegacy({ followers: [follower('carol')] });

    const carol = friends(db).carol!;
    expect(carol.status).toBe('legacyFollower');
    expect(carol.mySecret).toBe('my-secret-carol');
    expect(carol.theirSecret).toBeUndefined();
    expect(carol.theirKeys).toEqual([]);
  });

  it('keeps a follower we had asked to follow back as a legacy follower', async () => {
    const db = await migrateLegacy({ pending: [pending('dave')], followers: [follower('dave')] });

    expect(friends(db).dave!.status).toBe('legacyFollower');
  });

  it('drops a request that was never answered', async () => {
    const db = await migrateLegacy({ pending: [pending('erin')] });

    expect(friends(db)).toEqual({});
  });

  it('treats a followed row without keys as an unanswered request', async () => {
    const db = await migrateLegacy({ followed: [pending('frank')] });

    expect(friends(db)).toEqual({});
  });

  it('undoes following yourself and queues both of its secrets for revocation', async () => {
    const db = await migrateLegacy({
      followed: [{ ...followed(OWN_ID), followSecret: 'self-as-followed' }],
      followers: [{ ...follower(OWN_ID), followSecret: 'self-as-follower' }],
    });

    expect(friends(db)).toEqual({});
    expect(
      db
        .select()
        .from(feedRevokedFollowSecretsSchema)
        .all()
        .map((x) => x.secret)
        .sort(),
    ).toEqual(['self-as-followed', 'self-as-follower']);
  });

  it('migrates without a feed identity', async () => {
    const db = await migrateLegacy({ followed: [followed('alice')], identity: false });

    expect(friends(db).alice!.status).toBe('legacyFollowing');
  });
});
