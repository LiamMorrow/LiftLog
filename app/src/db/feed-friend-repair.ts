import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { and, eq, inArray } from 'drizzle-orm';
import { feedFriendRepairSchema } from '@/db/schema';

export type FriendRepairRow = typeof feedFriendRepairSchema.$inferSelect;

export function readFriendRepairs(db: ExpoSQLiteDatabase): FriendRepairRow[] {
  return db.select().from(feedFriendRepairSchema).all();
}

export function isAwaitingRepairReply(db: ExpoSQLiteDatabase, friendId: string) {
  return !!db
    .select({ friendId: feedFriendRepairSchema.friendId })
    .from(feedFriendRepairSchema)
    .where(and(eq(feedFriendRepairSchema.friendId, friendId), eq(feedFriendRepairSchema.awaitingReply, true)))
    .get();
}

export function markRepairsAnswered(db: ExpoSQLiteDatabase, friendIds: string[]) {
  if (friendIds.length) {
    db.update(feedFriendRepairSchema)
      .set({ awaitingReply: false })
      .where(inArray(feedFriendRepairSchema.friendId, friendIds))
      .run();
  }
}

export function writeFriendRepairs(db: ExpoSQLiteDatabase, rows: FriendRepairRow[]) {
  for (const row of rows) {
    db.insert(feedFriendRepairSchema)
      .values(row)
      .onConflictDoUpdate({ target: feedFriendRepairSchema.friendId, set: row })
      .run();
  }
}

export function deleteFriendRepairs(db: ExpoSQLiteDatabase, friendIds: string[]) {
  if (friendIds.length) {
    db.delete(feedFriendRepairSchema).where(inArray(feedFriendRepairSchema.friendId, friendIds)).run();
  }
}
