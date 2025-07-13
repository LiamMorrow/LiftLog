import { NativeModule, requireNativeModule } from 'expo';

export type RsaKeyPair = {
  spkiPublicKeyDer: Uint8Array;
  pkcs8PrivateKeyDer: Uint8Array;
};

declare class ReactNativeWebcryptoRSASha256Module extends NativeModule {
  generateKeyPair(length: number): Promise<RsaKeyPair>;
  sign(
    payload: Uint8Array,
    pkcs8PrivateKeyDer: Uint8Array,
  ): Promise<Uint8Array>;
  verify(
    payload: Uint8Array,
    signature: Uint8Array,
    spkiPublicKeyDer: Uint8Array,
  ): Promise<boolean>;
  encrypt(
    payload: Uint8Array,
    spkiPublicKeyDer: Uint8Array,
  ): Promise<Uint8Array>;
  decrypt(
    payload: Uint8Array,
    pkcs8PrivateKeyDer: Uint8Array,
  ): Promise<Uint8Array>;
}

// This call loads the native module object from the JSI.
const module = requireNativeModule<ReactNativeWebcryptoRSASha256Module>(
  'ReactNativeWebcryptoRSASha256',
);

export function generateRsaKeyPair(length: number): Promise<RsaKeyPair> {
  return module.generateKeyPair(length);
}
type RsaSignParams = {
  payload: Uint8Array;
  pkcs8PrivateKeyDer: Uint8Array;
};

export function rsaSign({
  payload,
  pkcs8PrivateKeyDer,
}: RsaSignParams): Promise<Uint8Array> {
  return module.sign(payload, pkcs8PrivateKeyDer);
}

type RsaVerifyParams = {
  payload: Uint8Array;
  signature: Uint8Array;
  spkiPublicKeyDer: Uint8Array;
};

export function rsaVerify({
  payload,
  signature,
  spkiPublicKeyDer,
}: RsaVerifyParams): Promise<boolean> {
  return module.verify(payload, signature, spkiPublicKeyDer);
}

type RsaEncryptParams = {
  payload: Uint8Array;
  spkiPublicKeyDer: Uint8Array;
};

export function rsaEncrypt({
  payload,
  spkiPublicKeyDer,
}: RsaEncryptParams): Promise<Uint8Array> {
  return module.encrypt(payload, spkiPublicKeyDer);
}

type RsaDecryptParams = {
  payload: Uint8Array;
  pkcs8PrivateKeyDer: Uint8Array;
};

export function rsaDecrypt({
  payload,
  pkcs8PrivateKeyDer,
}: RsaDecryptParams): Promise<Uint8Array> {
  return module.decrypt(payload, pkcs8PrivateKeyDer);
}
