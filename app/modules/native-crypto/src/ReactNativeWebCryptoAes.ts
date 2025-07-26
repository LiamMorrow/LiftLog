import { NativeModule, requireNativeModule } from 'expo';

export type AesKeyLengthBits = 128;
const bitsPerByte = 8;

declare class ReactNativeWebcryptoAesModule extends NativeModule {
  encryptCBC(
    key: Uint8Array,
    iv: Uint8Array,
    payload: Uint8Array,
  ): Promise<Uint8Array>;
  decryptCBC(
    key: Uint8Array,
    iv: Uint8Array,
    payload: Uint8Array,
  ): Promise<Uint8Array>;
}

// This call loads the native module object from the JSI.
const module = requireNativeModule<ReactNativeWebcryptoAesModule>(
  'ReactNativeWebcryptoAes',
);

export function generateAesKey(keyLengthBits: AesKeyLengthBits): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(keyLengthBits / bitsPerByte));
}
export function generateAesIv(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16));
}

type AesEncryptionParams = {
  key: Uint8Array;
  payload: Uint8Array;
  iv: Uint8Array;
};

export function encryptAesCbc({
  key,
  payload,
  iv,
}: AesEncryptionParams): Promise<Uint8Array> {
  const encrypted = module.encryptCBC(key, iv, payload);
  return encrypted;
}

export function decryptAesCbc({
  key,
  payload,
  iv,
}: AesEncryptionParams): Promise<Uint8Array> {
  const decrypted = module.decryptCBC(key, iv, payload);
  return decrypted;
}
