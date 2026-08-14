import Papa from 'papaparse';

export function cell(row: Record<string, string>, ...keys: string[]): string {
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

export function parseOptionalNumber(raw: string): number | undefined {
  if (!raw) {
    return undefined;
  }
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

export type ParseCsvTableResult =
  | { ok: true; fields: string[]; data: Record<string, string>[] }
  | { ok: false; error: string };

/** Strip BOM, header-parse with Papa; empty input and hard parse failures become errors. */
export function parseCsvTable(csvText: string): ParseCsvTableResult {
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

  return {
    ok: true,
    fields: parsed.meta.fields?.map((f) => f.trim()) ?? [],
    data: parsed.data.filter((raw): raw is Record<string, string> => !!raw && typeof raw === 'object'),
  };
}
