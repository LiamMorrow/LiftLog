export interface RsaPublicKey {
  spkiPublicKeyBytes: Uint8Array;
}

export interface AesKey {
  value: Uint8Array;
}

export interface RsaPrivateKey {
  pkcs8PrivateKeyBytes: Uint8Array;
}

export interface AesEncryptedAndRsaSignedData {
  encryptedPayload: Uint8Array;
  iv: AesIV;
}

export interface RsaEncryptedData {
  dataChunks: Uint8Array[];
}

export interface RsaKeyPair {
  publicKey: RsaPublicKey;
  privateKey: RsaPrivateKey;
}

export interface AesIV {
  value: Uint8Array;
}
