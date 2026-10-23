import BigNumber from 'bignumber.js';
import { getLocales, Locale } from 'expo-localization';

let locale: Locale | undefined;

function getLocale() {
  locale ??= getLocales()[0];
  return locale;
}

function decimalSeparator() {
  return getLocale().decimalSeparator ?? '.';
}

const plainDecimal = /^-?(\d+\.?\d*|\.\d+)$/;

/**
 * Will parse a big number whether it uses commas or periods for its decimal separator,
 * regardless of locale. The number MUST NOT use grouping separators
 */
export function localeParseBigNumber(numStr: string): BigNumber {
  const normalised = numStr.trim().replace(',', '.');
  return plainDecimal.test(normalised) ? new BigNumber(normalised) : new BigNumber(Number.NaN);
}

function formatBigNumber(
  num: BigNumber | undefined,
  decimalPlaces: number | undefined,
  format: BigNumber.Format,
): string {
  if (!num) {
    return '';
  }
  return decimalPlaces !== undefined ? num.toFormat(decimalPlaces, format) : num.toFormat(format);
}

/**
 * Formats a decimal using the current locale's decimal separator, with no grouping separators.
 * Use this for decimal editors, paired with {@link localeParseBigNumber}
 */
export function localeFormatBigNumber(num: BigNumber | undefined, decimalPlaces?: number): string {
  return formatBigNumber(num, decimalPlaces, { decimalSeparator: decimalSeparator(), groupSize: 0 });
}

/**
 * Formats a decimal purely for display purposes NEVER use this for data round trip.
 * Use {@link localeFormatBigNumber} for editors
 */
export function localeDisplayFormatBigNumber(num: BigNumber | undefined, decimalPlaces?: number): string {
  const separator = decimalSeparator();
  return formatBigNumber(num, decimalPlaces, {
    decimalSeparator: separator,
    groupSeparator: separator === ',' ? ' ' : ',',
    groupSize: 3,
  });
}
