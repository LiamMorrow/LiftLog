import { AesKey } from '@/models/encryption-models';
import { base64ToUint8Array, uint8ArrayToBase64 } from '@/utils/base64';

const CBC_HEX_KEY = /^[0-9a-f]{32}$/i;
const GCM_BASE64URL_KEY = /^[A-Za-z0-9_-]{22}$/;

export function toSharedItemKeyFragment(key: AesKey): string {
  if (key.algorithm === 'AES-CBC') {
    return Array.from(key.value, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  return uint8ArrayToBase64(key.value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function fromSharedItemKeyFragment(fragment: string | undefined): AesKey | undefined {
  if (fragment && CBC_HEX_KEY.test(fragment)) {
    const value = new Uint8Array(fragment.length / 2);
    for (let i = 0; i < value.length; i++) {
      value[i] = parseInt(fragment.substring(i * 2, i * 2 + 2), 16);
    }
    return { value, algorithm: 'AES-CBC' };
  }
  if (fragment && GCM_BASE64URL_KEY.test(fragment)) {
    const base64 = fragment.replace(/-/g, '+').replace(/_/g, '/') + '==';
    return { value: base64ToUint8Array(base64), algorithm: 'AES-GCM' };
  }
  return undefined;
}
