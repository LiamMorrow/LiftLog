import { deleteBodyweightEntry, readBodyweightEntries, writeBodyweightEntries } from '@/db/bodyweight-entries';
import { Weight } from '@/models/weight';
import { createTestDb } from '@/utils/__test__/test-db';
import { LocalDate } from '@js-joda/core';
import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { beforeEach, describe, expect, it } from 'vitest';

const entry = (id: string, date: string, kg: string) => ({
  id,
  date: LocalDate.parse(date),
  weight: new Weight(kg, 'kilograms'),
});

describe('bodyweight entries', () => {
  let db: ExpoSQLiteDatabase;
  beforeEach(async () => {
    db = await createTestDb();
  });

  it('reads back what was written, newest first', () => {
    writeBodyweightEntries(db, [entry('a', '2026-01-01', '80.5'), entry('b', '2026-02-01', '79.9')]);

    const entries = readBodyweightEntries(db);

    expect(entries.map((x) => x.id)).toEqual(['b', 'a']);
    expect(entries[1]!.date.equals(LocalDate.parse('2026-01-01'))).toBe(true);
    expect(entries[1]!.weight.toJSON()).toEqual(new Weight('80.5', 'kilograms').toJSON());
  });

  it('replaces an entry written again with the same id', () => {
    writeBodyweightEntries(db, [entry('a', '2026-01-01', '80')]);
    writeBodyweightEntries(db, [{ ...entry('a', '2026-01-03', '0'), weight: new Weight('176', 'pounds') }]);

    const entries = readBodyweightEntries(db);

    expect(entries).toHaveLength(1);
    expect(entries[0]!.date.equals(LocalDate.parse('2026-01-03'))).toBe(true);
    expect(entries[0]!.weight.toJSON()).toEqual(new Weight('176', 'pounds').toJSON());
  });

  it('reads only the entries within an inclusive range', () => {
    writeBodyweightEntries(db, [
      entry('a', '2026-01-01', '80'),
      entry('b', '2026-01-15', '81'),
      entry('c', '2026-01-31', '82'),
      entry('d', '2026-02-01', '83'),
    ]);

    const entries = readBodyweightEntries(db, {
      from: LocalDate.parse('2026-01-01'),
      to: LocalDate.parse('2026-01-31'),
    });

    expect(entries.map((x) => x.id)).toEqual(['c', 'b', 'a']);
  });

  it('deletes an entry', () => {
    writeBodyweightEntries(db, [entry('a', '2026-01-01', '80'), entry('b', '2026-01-02', '81')]);

    deleteBodyweightEntry(db, 'a');

    expect(readBodyweightEntries(db).map((x) => x.id)).toEqual(['b']);
  });
});
