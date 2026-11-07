import { AesKey } from '@/models/encryption-models';
import { base64UrlToUint8Array, uint8ArrayToBase64Url } from '@/utils/base64';

const CBC_HEX_KEY = /^[0-9a-f]{32}$/i;
const GCM_BASE64URL_KEY_LENGTH = 22;

export function toSharedItemKeyFragment(key: AesKey): string {
  if (key.algorithm === 'AES-CBC') {
    return Array.from(key.value, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  return uint8ArrayToBase64Url(key.value);
}

export function fromSharedItemKeyFragment(fragment: string | undefined): AesKey | undefined {
  if (fragment && CBC_HEX_KEY.test(fragment)) {
    const value = new Uint8Array(fragment.length / 2);
    for (let i = 0; i < value.length; i++) {
      value[i] = parseInt(fragment.substring(i * 2, i * 2 + 2), 16);
    }
    return { value, algorithm: 'AES-CBC' };
  }
  const value = fragment?.length === GCM_BASE64URL_KEY_LENGTH ? base64UrlToUint8Array(fragment) : undefined;
  return value && { value, algorithm: 'AES-GCM' };
}
