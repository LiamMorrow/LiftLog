import BigNumber from 'bignumber.js';
import { getLocales } from 'expo-localization';

function localeUsesComma(): boolean {
  return getLocales()[0].decimalSeparator === ',';
}

export function localeParseBigNumber(numStr: string): BigNumber {
  if (localeUsesComma()) {
    return new BigNumber(numStr.replace('.', '').replace(',', '.'));
  }
  return new BigNumber(numStr);
}

export function localeFormatBigNumber(
  num: BigNumber | undefined,
  decimalPlaces?: number,
): string {
  if (!num) {
    return '';
  }
  const format = {
    groupSeparator: localeUsesComma() ? ' ' : ',',
    groupSize: 3,
    decimalSeparator: localeUsesComma() ? ',' : '.',
  };
  if (localeUsesComma()) {
    return decimalPlaces !== undefined
      ? num.toFormat(decimalPlaces, format)
      : num.toFormat(format);
  }
  return decimalPlaces !== undefined
    ? num.toFormat(decimalPlaces, format)
    : num.toFormat(format);
}
