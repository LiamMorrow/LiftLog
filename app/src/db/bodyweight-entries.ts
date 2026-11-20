import { bodyweightEntriesSchema } from '@/db/schema';
import { BodyweightEntry } from '@/models/bodyweight-entry';
import { fromLocalDateJSON, toLocalDateJSON } from '@/models/storage/versions/libs';
import { LocalDateRange } from '@/models/time-models';
import { Weight } from '@/models/weight';
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';
import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';

export function readBodyweightEntries(db: ExpoSQLiteDatabase, range?: LocalDateRange): BodyweightEntry[] {
  return db
    .select()
    .from(bodyweightEntriesSchema)
    .where(
      range &&
        and(
          gte(bodyweightEntriesSchema.date, toLocalDateJSON(range.from)),
          lte(bodyweightEntriesSchema.date, toLocalDateJSON(range.to)),
        ),
    )
    .orderBy(desc(bodyweightEntriesSchema.date))
    .all()
    .map((row) => ({ id: row.id, date: fromLocalDateJSON(row.date), weight: Weight.fromJSON(row) }));
}

export function writeBodyweightEntries(db: ExpoSQLiteDatabase, entries: BodyweightEntry[]) {
  if (!entries.length) {
    return;
  }
  db.insert(bodyweightEntriesSchema)
    .values(entries.map(({ id, date, weight }) => ({ id, date: toLocalDateJSON(date), ...weight.toJSON() })))
    .onConflictDoUpdate({
      target: bodyweightEntriesSchema.id,
      set: { date: sql`excluded.date`, value: sql`excluded.value`, unit: sql`excluded.unit` },
    })
    .run();
}

export function deleteBodyweightEntry(db: ExpoSQLiteDatabase, id: string) {
  db.delete(bodyweightEntriesSchema).where(eq(bodyweightEntriesSchema.id, id)).run();
}
