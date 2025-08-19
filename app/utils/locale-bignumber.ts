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

export function localeFormatBigNumber(num: BigNumber | undefined): string {
  if (!num) {
    return '';
  }
  if (localeUsesComma()) {
    return num.toFormat({ decimalSeparator: ',' });
  }
  return num.toFormat();
}
