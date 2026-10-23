import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import BigNumber from 'bignumber.js';
import { localeDisplayFormatBigNumber, localeFormatBigNumber, localeParseBigNumber } from './locale-bignumber';

const mockLocale = vi.hoisted(() => ({ decimalSeparator: '.', digitGroupingSeparator: ',' }));
vi.mock('expo-localization', () => ({ getLocales: () => [mockLocale] }));

const locales = {
  en: { decimalSeparator: '.', digitGroupingSeparator: ',' },
  de: { decimalSeparator: ',', digitGroupingSeparator: '.' },
  fr: { decimalSeparator: ',', digitGroupingSeparator: ' ' },
};

function useLocale(name: keyof typeof locales) {
  Object.assign(mockLocale, locales[name]);
}

beforeEach(() => useLocale('en'));

describe.each(Object.keys(locales) as (keyof typeof locales)[])('in %s', (name) => {
  beforeEach(() => useLocale(name));

  it.each([
    ['12.5', '12.5'],
    ['12,5', '12.5'],
    ['12', '12'],
    ['12.', '12'],
    ['12,', '12'],
    ['.5', '0.5'],
    ['-2,5', '-2.5'],
    [' 7.5 ', '7.5'],
    ['1000', '1000'],
  ])('parses %j as %s', (input, expected) => {
    expect(localeParseBigNumber(input).toString()).toBe(expected);
  });

  it.each(['', '-', '.', 'abc', '1.000,5', '1,000.5', '1,000,000', '1 000', '1 000', '1.2.3', '1e3', 'Infinity'])(
    'rejects %j',
    (input) => {
      expect(localeParseBigNumber(input).isNaN()).toBe(true);
    },
  );

  it('round trips through localeFormatBigNumber', () => {
    fc.assert(
      fc.property(fc.double({ noNaN: true, noDefaultInfinity: true }), (double) => {
        const value = new BigNumber(double);
        expect(localeParseBigNumber(localeFormatBigNumber(value)).isEqualTo(value)).toBe(true);
      }),
    );
  });
});

describe('localeFormatBigNumber', () => {
  it('never groups digits', () => {
    expect(localeFormatBigNumber(new BigNumber('12345.5'))).toBe('12345.5');
    useLocale('de');
    expect(localeFormatBigNumber(new BigNumber('12345.5'))).toBe('12345,5');
  });

  it('pads to decimal places', () => {
    expect(localeFormatBigNumber(new BigNumber('1234.5'), 2)).toBe('1234.50');
  });

  it('formats undefined as empty', () => {
    expect(localeFormatBigNumber(undefined)).toBe('');
  });
});

describe('localeDisplayFormatBigNumber', () => {
  it('groups with a comma when the decimal separator is a dot', () => {
    expect(localeDisplayFormatBigNumber(new BigNumber('12345.5'))).toBe('12,345.5');
  });

  it('groups with a space when the decimal separator is a comma', () => {
    useLocale('de');
    expect(localeDisplayFormatBigNumber(new BigNumber('12345.5'))).toBe('12 345,5');
  });

  it('pads to decimal places', () => {
    expect(localeDisplayFormatBigNumber(new BigNumber('1234.5'), 2)).toBe('1,234.50');
  });
});
