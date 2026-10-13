import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { inArray } from 'drizzle-orm';
import { upsert } from '@/db/helpers';
import { feedFriendsSchema, feedRevokedFollowSecretsSchema } from '@/db/schema';
import { Friend } from '@/models/feed-models';
import { friendMigrations } from '@/models/storage/versions/migrations';
import { AnyVersionFriendJSON } from '@/models/storage/versions/any';

export function readFriends(db: ExpoSQLiteDatabase): Friend[] {
  return db
    .select()
    .from(feedFriendsSchema)
    .all()
    .map((x) => Friend.fromJSON(friendMigrations.migrate(x.payload)));
}

export function writeFriends(db: ExpoSQLiteDatabase, friends: Friend[]) {
  upsert<AnyVersionFriendJSON, string>(
    db,
    feedFriendsSchema,
    friends.map((friend) => ({ id: friend.id, payload: friend.toJSON() })),
  );
}

export function deleteFriends(db: ExpoSQLiteDatabase, ids: string[]) {
  if (ids.length) {
    db.delete(feedFriendsSchema).where(inArray(feedFriendsSchema.id, ids)).run();
  }
}

export function queueFollowSecretRevocationsIn(db: ExpoSQLiteDatabase, secrets: string[]) {
  if (secrets.length) {
    db.insert(feedRevokedFollowSecretsSchema)
      .values(secrets.map((secret) => ({ secret })))
      .onConflictDoNothing()
      .run();
  }
}
