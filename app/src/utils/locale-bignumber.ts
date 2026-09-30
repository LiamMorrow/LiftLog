import BigNumber from 'bignumber.js';
import { getLocales, Locale } from 'expo-localization';

let locale: Locale | undefined;

function getLocale() {
  locale ??= getLocales()[0];
  return locale;
}

export function localeParseBigNumber(numStr: string): BigNumber {
  const locale = getLocale();
  try {
    return BigNumber.fromFormat(numStr, {
      decimalSeparator: locale.decimalSeparator ?? '.',
      groupSeparator: locale.digitGroupingSeparator ?? ',',
    });
  } catch {
    return new BigNumber(Number.NaN);
  }
}

export function localeFormatBigNumber(num: BigNumber | undefined, decimalPlaces?: number): string {
  if (!num) {
    return '';
  }
  const locale = getLocale();
  const format = {
    groupSeparator: locale?.digitGroupingSeparator ? ' ' : ',',
    groupSize: 3,
    decimalSeparator: locale.decimalSeparator ?? '.',
  };

  return decimalPlaces !== undefined ? num.toFormat(decimalPlaces, format) : num.toFormat(format);
}
