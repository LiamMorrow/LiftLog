import {
  AesEncryptedAndRsaSignedData,
  AesIV,
  AesKey,
  RsaEncryptedData,
  RsaKeyPair,
  RsaPrivateKey,
  RsaPublicKey,
} from '@/models/encryption-models';
import Aes from 'react-native-aes-crypto';
import { RSA } from 'react-native-rsa-native';
import {
  fromUrlSafeHexString,
  toUrlSafeHexString,
} from '@/utils/to-url-safe-hex-string';

// SHA-256 hash length in bytes
const SignatureLengthBytes = 256;

export class EncryptionService {
  async generateAesKey(): Promise<AesKey> {
    const key = await Aes.randomKey(16);

    return {
      value: fromUrlSafeHexString(key),
    };
  }

  async decryptAesCbcAndVerifyRsa256PssAsync(
    data: AesEncryptedAndRsaSignedData,
    key: AesKey,
    publicKey: RsaPublicKey,
  ): Promise<Uint8Array> {
    const base64 = uint8ArrayToBase64(data.encryptedPayload);
    const decr = await Aes.decrypt(
      base64,
      toUrlSafeHexString(key.value),
      toUrlSafeHexString(data.iv.value),
      'aes-128-cbc',
    );
    const decrypted = base64ToUint8Array(decr);

    const signature = decrypted.slice(decrypted.length - SignatureLengthBytes);
    const payload = decrypted.slice(0, decrypted.length - SignatureLengthBytes);

    const verified = await this.verifyRsaPssSha256Async(
      payload,
      signature,
      publicKey,
    );

    if (!verified) {
      throw new Error('Signature verification failed');
    }

    return payload;
  }

  async signRsa256PssAndEncryptAesCbcAsync(
    data: Uint8Array,
    key: AesKey,
    privateKey: RsaPrivateKey,
    aesIv?: AesIV | null,
  ): Promise<AesEncryptedAndRsaSignedData> {
    const iv = aesIv?.value ?? crypto.getRandomValues(new Uint8Array(16));
    const signature = await this.signRsaPssSha256Async(data, privateKey);

    const payloadBytes = new Uint8Array([...data, ...signature]);
    const payloadBase64 = uint8ArrayToBase64(payloadBytes);

    const encrypted = await Aes.encrypt(
      payloadBase64,
      toUrlSafeHexString(key.value),
      toUrlSafeHexString(iv),
      'aes-128-cbc',
    );
    const encryptedPayload = base64ToUint8Array(encrypted);
    return {
      encryptedPayload,
      iv: { value: iv },
    };
  }

  async generateRsaKeys(): Promise<RsaKeyPair> {
    const kp = await RSA.generateKeys(2048);
    const privateKey = pemToDer(kp.private);
    const publicKey = pemToDer(kp.public);
    return {
      privateKey: {
        pkcs8PrivateKeyBytes: privateKey,
      },
      publicKey: {
        spkiPublicKeyBytes: publicKey,
      },
    };
  }

  async encryptRsaOaepSha256Async(
    data: Uint8Array,
    publicKey: RsaPublicKey,
  ): Promise<RsaEncryptedData> {
    const chunkedData: Uint8Array[] = [];
    // RSA can only encrypt 122 bytes at a time
    for (let i = 0; i < data.length; i += 122) {
      chunkedData.push(data.slice(i, i + 122));
    }
    const key = derToPem(publicKey.spkiPublicKeyBytes, 'PUBLIC KEY');
    return {
      dataChunks: await Promise.all(
        chunkedData.map(async (chunk) => {
          return base64ToUint8Array(
            await RSA.encrypt64(uint8ArrayToBase64(chunk), key),
          );
        }),
      ),
    };
  }

  async decryptRsaOaepSha256Async(
    data: RsaEncryptedData,
    privateKey: RsaPrivateKey,
  ): Promise<Uint8Array> {
    const chunkedData: Uint8Array[] = [];
    for (let i = 0; i < data.dataChunks.length; i++) {
      chunkedData.push(data.dataChunks[i]);
    }
    const key = derToPem(privateKey.pkcs8PrivateKeyBytes, 'PRIVATE KEY');
    const decryptedChunks = await Promise.all(
      chunkedData.map(async (chunk) => {
        return base64ToUint8Array(
          await RSA.decrypt64(uint8ArrayToBase64(chunk), key),
        );
      }),
    );
    return new Uint8Array(
      decryptedChunks.reduce(
        (acc, chunk) => [...acc, ...chunk],
        [] as number[],
      ),
    );
  }

  async signRsaPssSha256Async(
    data: Uint8Array,
    privateKey: RsaPrivateKey,
  ): Promise<Uint8Array> {
    const key = derToPem(privateKey.pkcs8PrivateKeyBytes, 'PRIVATE KEY');
    const hashHex = await Aes.sha256(uint8ArrayToBase64(data));
    console.log(hashHex);
    return base64ToUint8Array(
      await RSA.sign64WithAlgorithm(
        uint8ArrayToBase64(fromUrlSafeHexString(hashHex)),
        key,
        'RSASSA-PSS',
      ),
    );
  }

  async verifyRsaPssSha256Async(
    data: Uint8Array,
    signature: Uint8Array,
    publicKey: RsaPublicKey,
  ): Promise<boolean> {
    const keyPem = derToPem(publicKey.spkiPublicKeyBytes, 'PUBLIC KEY');
    const payloadHashHex = await Aes.sha256(uint8ArrayToBase64(data));
    const payloadHashBytes = fromUrlSafeHexString(payloadHashHex);
    const payloadHashBase64 = uint8ArrayToBase64(payloadHashBytes);
    return RSA.verify64WithAlgorithm(
      uint8ArrayToBase64(signature),
      payloadHashBase64,
      keyPem,
      'RSASSA-PSS',
    );
  }
}

/**
 * Converts a DER-encoded Uint8Array to a PEM-formatted string.
 * @param der The DER-encoded data.
 * @param label The PEM label, e.g. "PUBLIC KEY" or "PRIVATE KEY".
 */
function derToPem(
  der: Uint8Array,
  label: 'PRIVATE KEY' | 'PUBLIC KEY',
): string {
  const base64 = btoa(String.fromCharCode(...der));
  const lines = base64.match(/.{1,64}/g) || [];
  return [
    `-----BEGIN RSA ${label}-----`,
    ...lines,
    `-----END RSA ${label}-----`,
  ].join('\n');
}

/**
 * Converts a PEM-formatted string to a DER-encoded Uint8Array.
 * @param pem The PEM string.
 */
function pemToDer(pem: string): Uint8Array {
  const base64 = pem
    .replace(/-----BEGIN [^-]+-----/, '')
    .replace(/-----END [^-]+-----/, '')
    .replace(/\s+/g, '');
  const binary = atob(base64);
  const der = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    der[i] = binary.charCodeAt(i);
  }
  return der;
}

/**
 * Converts a Uint8Array to a base64 string.
 * @param arr The Uint8Array to convert.
 */
function uint8ArrayToBase64(arr: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < arr.length; i++) {
    binary += String.fromCharCode(arr[i]);
  }
  return btoa(binary);
}

/**
 * Converts a base64 string to a Uint8Array.
 * @param base64 The base64 string to convert.
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    arr[i] = binary.charCodeAt(i);
  }
  return arr;
}
