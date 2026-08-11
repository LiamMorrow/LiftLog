import Papa from 'papaparse';

/** One set row from a third-party workout history CSV export. */
export type WorkoutCsvRow = {
  date: string;
  exercise: string;
  category: string;
  weight: number | undefined;
  weightUnit: string;
  reps: number | undefined;
  distance: number | undefined;
  distanceUnit: string;
  time: string;
  comment: string;
};

export type ParseWorkoutCsvResult =
  | { ok: true; rows: WorkoutCsvRow[] }
  | { ok: false; error: string };

const REQUIRED_HEADERS = ['Date', 'Exercise', 'Weight', 'Weight Unit', 'Reps'] as const;

function cell(row: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    const direct = row[key];
    if (direct !== undefined && direct !== '') {
      return direct.trim();
    }
    const found = Object.entries(row).find(([k]) => k.trim().toLowerCase() === key.toLowerCase());
    if (found && found[1] !== undefined && found[1] !== '') {
      return String(found[1]).trim();
    }
  }
  return '';
}

function parseOptionalNumber(raw: string): number | undefined {
  if (!raw) {
    return undefined;
  }
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Parse workout history CSV export text into typed rows.
 * Expects headers: Date, Exercise, Category, Weight, Weight Unit, Reps, …
 */
export function parseWorkoutCsv(csvText: string): ParseWorkoutCsvResult {
  const text = csvText.replace(/^\uFEFF/, '').trim();
  if (!text) {
    return { ok: false, error: 'CSV is empty' };
  }

  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  if (parsed.errors.length > 0 && (!parsed.data || parsed.data.length === 0)) {
    return { ok: false, error: parsed.errors[0]?.message ?? 'Failed to parse CSV' };
  }

  const fields = parsed.meta.fields?.map((f) => f.trim()) ?? [];
  const missing = REQUIRED_HEADERS.filter(
    (h) => !fields.some((f) => f.toLowerCase() === h.toLowerCase()),
  );
  if (missing.length > 0) {
    return {
      ok: false,
      error: `Missing CSV columns: ${missing.join(', ')}`,
    };
  }

  const rows: WorkoutCsvRow[] = [];
  for (const raw of parsed.data) {
    if (!raw || typeof raw !== 'object') {
      continue;
    }
    const date = cell(raw, 'Date');
    const exercise = cell(raw, 'Exercise');
    if (!date || !exercise) {
      continue;
    }
    rows.push({
      date,
      exercise,
      category: cell(raw, 'Category'),
      weight: parseOptionalNumber(cell(raw, 'Weight')),
      weightUnit: cell(raw, 'Weight Unit'),
      reps: parseOptionalNumber(cell(raw, 'Reps')),
      distance: parseOptionalNumber(cell(raw, 'Distance')),
      distanceUnit: cell(raw, 'Distance Unit'),
      time: cell(raw, 'Time'),
      comment: cell(raw, 'Comment'),
    });
  }

  if (rows.length === 0) {
    return { ok: false, error: 'No workout rows found in CSV' };
  }

  return { ok: true, rows };
}
