import { describe, it, expect } from 'vitest';
import { EncryptionService } from './encryption-service';
import { readFileSync } from 'fs';

describe('EncryptionService', () => {
  const encryptionService = new EncryptionService();

  describe('generateAesKey', () => {
    it('should generate a valid AES key', async () => {
      const key = await encryptionService.generateAesKey();
      expect(key).toBeDefined();
      expect(key.value).toBeInstanceOf(Uint8Array);
    });
  });

  describe('Encrypting and Decrypting', () => {
    describe('aes', () => {
      it('should encrypt and decrypt a payload successfully', async () => {
        const key = await encryptionService.generateAesKey();
        const rsaKeyPair = await encryptionService.generateRsaKeys();
        const data = new TextEncoder().encode('Hello, world!');

        const encryptedData =
          await encryptionService.signRsa256PssAndEncryptAesCbcAsync(
            data,
            key,
            rsaKeyPair.privateKey,
            null,
          );

        const decryptedData =
          await encryptionService.decryptAesCbcAndVerifyRsa256PssAsync(
            encryptedData,
            key,
            rsaKeyPair.publicKey,
          );

        expect(Buffer.from(decryptedData).toString('base64')).toEqual(
          Buffer.from(data).toString('base64'),
        );
      });

      describe('using a supplied IV', () => {
        it('should encrypt and decrypt a payload with the same IV', async () => {
          const key = await encryptionService.generateAesKey();
          const rsaKeyPair = await encryptionService.generateRsaKeys();
          const data1 = new TextEncoder().encode('Hello, world!');
          const data2 = new TextEncoder().encode('Goodbye, world!');

          const encryptedData1 =
            await encryptionService.signRsa256PssAndEncryptAesCbcAsync(
              data1,
              key,
              rsaKeyPair.privateKey,
              null,
            );

          const decryptedData1 =
            await encryptionService.decryptAesCbcAndVerifyRsa256PssAsync(
              encryptedData1,
              key,
              rsaKeyPair.publicKey,
            );

          const encryptedData2 =
            await encryptionService.signRsa256PssAndEncryptAesCbcAsync(
              data2,
              key,
              rsaKeyPair.privateKey,
              encryptedData1.iv,
            );

          const decryptedData2 =
            await encryptionService.decryptAesCbcAndVerifyRsa256PssAsync(
              {
                encryptedPayload: encryptedData2.encryptedPayload,
                iv: encryptedData1.iv,
              },
              key,
              rsaKeyPair.publicKey,
            );

          expect(Buffer.from(decryptedData1).toString('base64')).toEqual(
            Buffer.from(data1).toString('base64'),
          );
          expect(Buffer.from(decryptedData2).toString('base64')).toEqual(
            Buffer.from(data2).toString('base64'),
          );
          expect(encryptedData1.iv.value).toEqual(encryptedData2.iv.value);
        });
      });

      describe('when the payload is tampered with', () => {
        it('should throw an error', async () => {
          const key = await encryptionService.generateAesKey();
          const rsaKeyPair = await encryptionService.generateRsaKeys();
          const data = new TextEncoder().encode('Hello, world!');

          const encryptedData =
            await encryptionService.signRsa256PssAndEncryptAesCbcAsync(
              data,
              key,
              rsaKeyPair.privateKey,
              null,
            );

          // Tamper with the encrypted payload
          encryptedData.encryptedPayload[0] ^= 0xff;

          await expect(
            encryptionService.decryptAesCbcAndVerifyRsa256PssAsync(
              encryptedData,
              key,
              rsaKeyPair.publicKey,
            ),
          ).rejects.toThrowError('Signature verification failed');
        });
      });
    });

    describe('rsa', () => {
      it('should encrypt and decrypt a payload successfully using RSA', async () => {
        const rsaKeyPair = await encryptionService.generateRsaKeys();
        const data = new TextEncoder().encode('Hello, RSA!');

        const encryptedData = await encryptionService.encryptRsaOaepSha256Async(
          data,
          rsaKeyPair.publicKey,
        );

        const decryptedData = await encryptionService.decryptRsaOaepSha256Async(
          encryptedData,
          rsaKeyPair.privateKey,
        );

        expect(Buffer.from(decryptedData).toString('base64')).toEqual(
          Buffer.from(data).toString('base64'),
        );
      });

      it('should sign and verify a payload successfully using RSA', async () => {
        const rsaKeyPair = await encryptionService.generateRsaKeys();
        const data = new TextEncoder().encode('Hello, RSA Signature!');

        const signature = await encryptionService.signRsaPssSha256Async(
          data,
          rsaKeyPair.privateKey,
        );

        const isValid = await encryptionService.verifyRsaPssSha256Async(
          data,
          signature,
          rsaKeyPair.publicKey,
        );

        expect(isValid).toBe(true);
      });

      it('should fail verification if the payload is tampered with', async () => {
        const rsaKeyPair = await encryptionService.generateRsaKeys();
        const data = new TextEncoder().encode('Hello, RSA Signature!');

        const signature = await encryptionService.signRsaPssSha256Async(
          data,
          rsaKeyPair.privateKey,
        );

        // Tamper with the data
        data[0] ^= 0xff;

        const isValid = await encryptionService.verifyRsaPssSha256Async(
          data,
          signature,
          rsaKeyPair.publicKey,
        );

        expect(isValid).toBe(false);
      });

      it('should fail decryption if the encrypted data is tampered with', async () => {
        const rsaKeyPair = await encryptionService.generateRsaKeys();
        const data = new TextEncoder().encode('Hello, RSA!');

        const encryptedData = await encryptionService.encryptRsaOaepSha256Async(
          data,
          rsaKeyPair.publicKey,
        );

        // Tamper with the encrypted data
        encryptedData.dataChunks[0][0] ^= 0xff;

        await expect(
          encryptionService.decryptRsaOaepSha256Async(
            encryptedData,
            rsaKeyPair.privateKey,
          ),
        ).rejects.toThrow();
      });
    });
  });

  describe('Decrypting existing file', () => {
    it('can decrypt a file that was encrypted via aes with the dotnet app', async () => {
      const encryptedBytes = readFileSync(
        __dirname + '/test-assets/aes/encrypted.bin',
      );
      const ivBytes = readFileSync(__dirname + '/test-assets/aes/iv.bin');
      const keyBytes = readFileSync(__dirname + '/test-assets/aes/key.bin');
      const publicKey = readFileSync(
        __dirname + '/test-assets/aes/publicKey.bin',
      );
      const decrypted =
        await encryptionService.decryptAesCbcAndVerifyRsa256PssAsync(
          {
            encryptedPayload: encryptedBytes,
            iv: { value: ivBytes },
          },
          {
            value: keyBytes,
          },
          {
            spkiPublicKeyBytes: publicKey,
          },
        );

      expect(Buffer.from(decrypted).toString()).toBe('Hello, world!');
    });

    it('can decrypt a file that was encrypted via RSA with the dotnet app', async () => {
      const dataChunks = [
        readFileSync(__dirname + '/test-assets/rsa/encrypted-0.bin'),
        readFileSync(__dirname + '/test-assets/rsa/encrypted-1.bin'),
        readFileSync(__dirname + '/test-assets/rsa/encrypted-2.bin'),
        readFileSync(__dirname + '/test-assets/rsa/encrypted-3.bin'),
      ];
      const privateKey = readFileSync(
        __dirname + '/test-assets/rsa/privateKey.bin',
      );
      const decrypted = await encryptionService.decryptRsaOaepSha256Async(
        { dataChunks },
        { pkcs8PrivateKeyBytes: privateKey },
      );

      expect(Buffer.from(decrypted).toString()).toBe(
        'Hello, world!'.repeat(30),
      );
    });
  });
});
