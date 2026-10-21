import { beforeEach, expect, test, vi } from 'vitest';

const { currentLocale } = vi.hoisted(() => ({
  currentLocale: { decimalSeparator: ',', digitGroupingSeparator: '.' },
}));

vi.mock('expo-localization', () => ({
  getLocales: () => [currentLocale],
}));

beforeEach(() => {
  vi.resetModules();
  currentLocale.decimalSeparator = ',';
  currentLocale.digitGroupingSeparator = '.';
});

async function parse(value: string) {
  const { localeParseBigNumber } = await import('./locale-bignumber');
  return localeParseBigNumber(value).toString();
}

test('accepts dot or comma for decimal weights in comma locales', async () => {
  expect(await parse('12,5')).toBe('12.5');
  expect(await parse('12.5')).toBe('12.5');
  expect(await parse('.5')).toBe('0.5');
  expect(await parse('-12.5')).toBe('-12.5');
});

test('preserves localized grouping when comma is also present', async () => {
  expect(await parse('1.234,5')).toBe('1234.5');
  expect(await parse('1.234.567')).toBe('1234567');
});

test('keeps dot locale parsing unchanged', async () => {
  currentLocale.decimalSeparator = '.';
  currentLocale.digitGroupingSeparator = ',';
  expect(await parse('12.5')).toBe('12.5');
  expect(await parse('1,234.5')).toBe('1234.5');
});
