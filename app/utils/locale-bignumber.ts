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
  if (localeUsesComma()) {
    return decimalPlaces !== undefined
      ? num.toFormat(decimalPlaces, { decimalSeparator: ',' })
      : num.toFormat({ decimalSeparator: ',' });
  }
  return num.toFormat(decimalPlaces);
}
