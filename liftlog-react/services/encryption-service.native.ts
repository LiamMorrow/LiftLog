import {
  AesEncryptedAndRsaSignedData,
  AesIV,
  AesKey,
  RsaEncryptedData,
  RsaKeyPair,
  RsaPrivateKey,
  RsaPublicKey,
} from '@/models/encryption-models';
import {
  decryptAesCbc,
  encryptAesCbc,
  generateAesIv,
  generateAesKey,
  generateRsaKeyPair,
  rsaDecrypt,
  rsaEncrypt,
  rsaSign,
  rsaVerify,
} from '@/modules/native-crypto';
import { sha256Hash } from '@/modules/native-crypto/src/ReactNativeWebcryptoModule';

const SignatureLengthBytes = 256;

export class EncryptionService {
  async generateAesKey(): Promise<AesKey> {
    return { value: generateAesKey(128) };
  }

  async decryptAesCbcAndVerifyRsa256PssAsync(
    data: AesEncryptedAndRsaSignedData,
    key: AesKey,
    publicKey: RsaPublicKey,
  ): Promise<Uint8Array> {
    const decrypted = new Uint8Array(
      await decryptAesCbc({
        iv: data.iv.value,
        key: key.value,
        payload: data.encryptedPayload,
      }),
    );

    const signature = decrypted.slice(decrypted.length - SignatureLengthBytes);
    const payload = decrypted.slice(0, decrypted.length - SignatureLengthBytes);

    const payloadHash = await sha256Hash(payload);

    const verified = await rsaVerify({
      payload: payloadHash,
      signature,
      spkiPublicKeyDer: publicKey.spkiPublicKeyBytes,
    });

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
    const iv = aesIv?.value ?? generateAesIv();

    const dataHash = await sha256Hash(data);

    const signature = await rsaSign({
      payload: dataHash,
      pkcs8PrivateKeyDer: privateKey.pkcs8PrivateKeyBytes,
    });

    const payload = new Uint8Array([...data, ...new Uint8Array(signature)]);

    const encrypted = await encryptAesCbc({
      payload,
      key: key.value,
      iv,
    });

    return {
      encryptedPayload: new Uint8Array(encrypted),
      iv: { value: iv },
    };
  }

  async generateRsaKeys(): Promise<RsaKeyPair> {
    const keyPair = await generateRsaKeyPair(2048);

    return {
      privateKey: { pkcs8PrivateKeyBytes: keyPair.pkcs8PrivateKeyDer },
      publicKey: { spkiPublicKeyBytes: keyPair.spkiPublicKeyDer },
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
    return {
      dataChunks: await Promise.all(
        chunkedData.map(async (chunk) => {
          return await rsaEncrypt({
            payload: chunk,
            spkiPublicKeyDer: publicKey.spkiPublicKeyBytes,
          });
        }),
      ),
    };
  }

  async sha256(data: Uint8Array<ArrayBuffer>): Promise<Uint8Array> {
    return await sha256Hash(data);
  }

  async decryptRsaOaepSha256Async(
    data: RsaEncryptedData,
    privateKey: RsaPrivateKey,
  ): Promise<Uint8Array> {
    const chunkedData: Uint8Array[] = [];
    for (let i = 0; i < data.dataChunks.length; i++) {
      chunkedData.push(data.dataChunks[i]);
    }
    const decryptedChunks = await Promise.all(
      chunkedData.map(async (chunk) => {
        return await rsaDecrypt({
          payload: chunk,
          pkcs8PrivateKeyDer: privateKey.pkcs8PrivateKeyBytes,
        });
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
    const hash = await sha256Hash(data);
    return new Uint8Array(
      await rsaSign({
        payload: hash,
        pkcs8PrivateKeyDer: privateKey.pkcs8PrivateKeyBytes,
      }),
    );
  }

  async verifyRsaPssSha256Async(
    data: Uint8Array,
    signature: Uint8Array,
    publicKey: RsaPublicKey,
  ): Promise<boolean> {
    const hash = await sha256Hash(data);
    return await rsaVerify({
      payload: hash,
      signature,
      spkiPublicKeyDer: publicKey.spkiPublicKeyBytes,
    });
  }
}
