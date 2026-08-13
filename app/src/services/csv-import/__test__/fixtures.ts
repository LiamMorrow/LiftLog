import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export type CsvImportFixtureName =
  | 'fitnotes-android-export-kgs.csv'
  | 'fitnotes-android-export-lbs.csv'
  | 'stronglifts-export-kg.csv'
  | 'stronglifts-export-lb.csv';

function fixturePath(name: CsvImportFixtureName): string {
  return join(__dirname, '../../../../../tests/csv-import-test-files', name);
}

export function readCsvImportFixture(name: CsvImportFixtureName): string {
  return readFileSync(fixturePath(name), 'utf8');
}

export function csvImportFixtureBytes(name: CsvImportFixtureName): Uint8Array {
  return new Uint8Array(readFileSync(fixturePath(name)));
}
