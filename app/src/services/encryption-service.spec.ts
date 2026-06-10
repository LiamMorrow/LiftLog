import { describe, it, expect, beforeAll } from 'vitest';
import {
  EncryptionService,
  fromJsonBytes as fromJsonBytes,
  toJsonBytes,
} from './encryption-service';
import type { AesKey, RsaKeyPair } from '@/models/encryption-models';

describe('EncryptionService', () => {
  let svc: EncryptionService;
  let aesKey: AesKey;
  let rsaKeyPair: RsaKeyPair;

  beforeAll(async () => {
    svc = new EncryptionService();
    [aesKey, rsaKeyPair] = await Promise.all([
      svc.generateAesKey(),
      svc.generateRsaKeys(),
    ]);
  });

  // ---------------------------------------------------------------------------
  // AES key generation
  // ---------------------------------------------------------------------------

  describe('generateAesKey', () => {
    it('returns a 16-byte (128-bit) key', async () => {
      const key = await svc.generateAesKey();
      expect(key.value).toBeInstanceOf(Uint8Array);
      expect(key.value.byteLength).toBe(16);
    });

    it('produces a different key on each call', async () => {
      const [a, b] = await Promise.all([
        svc.generateAesKey(),
        svc.generateAesKey(),
      ]);
      expect(a.value).not.toEqual(b.value);
    });
  });

  // ---------------------------------------------------------------------------
  // RSA key generation
  // ---------------------------------------------------------------------------

  describe('generateRsaKeys', () => {
    it('returns non-empty PKCS8 private key bytes', () => {
      expect(rsaKeyPair.privateKey.pkcs8PrivateKeyBytes).toBeInstanceOf(
        Uint8Array,
      );
      expect(
        rsaKeyPair.privateKey.pkcs8PrivateKeyBytes.byteLength,
      ).toBeGreaterThan(0);
    });

    it('returns non-empty SPKI public key bytes', () => {
      expect(rsaKeyPair.publicKey.spkiPublicKeyBytes).toBeInstanceOf(
        Uint8Array,
      );
      expect(
        rsaKeyPair.publicKey.spkiPublicKeyBytes.byteLength,
      ).toBeGreaterThan(0);
    });

    it('produces a different key pair on each call', async () => {
      const second = await svc.generateRsaKeys();
      expect(rsaKeyPair.privateKey.pkcs8PrivateKeyBytes).not.toEqual(
        second.privateKey.pkcs8PrivateKeyBytes,
      );
    });
  });

  // ---------------------------------------------------------------------------
  // SHA-256
  // ---------------------------------------------------------------------------

  describe('sha256', () => {
    it('returns a 32-byte digest', async () => {
      const hash = await svc.sha256(new Uint8Array([1, 2, 3]));
      expect(hash).toBeInstanceOf(Uint8Array);
      expect(hash.byteLength).toBe(32);
    });

    it('is deterministic', async () => {
      const data = new TextEncoder().encode('hello');
      const [a, b] = await Promise.all([svc.sha256(data), svc.sha256(data)]);
      expect(a).toEqual(b);
    });

    it('produces different hashes for different inputs', async () => {
      const a = await svc.sha256(new TextEncoder().encode('hello'));
      const b = await svc.sha256(new TextEncoder().encode('world'));
      expect(a).not.toEqual(b);
    });
  });

  // ---------------------------------------------------------------------------
  // AES-CBC encrypt / decrypt (via the signed+encrypted round-trip)
  // ---------------------------------------------------------------------------

  describe('signRsa256PssAndEncryptAesCbcAsync / decryptAesCbcAndVerifyRsa256PssAsync', () => {
    it('round-trips arbitrary data', async () => {
      const plaintext = new TextEncoder().encode('hello liftlog');
      const encrypted = await svc.signRsa256PssAndEncryptAesCbcAsync(
        plaintext,
        aesKey,
        rsaKeyPair.privateKey,
      );
      const decrypted = await svc.decryptAesCbcAndVerifyRsa256PssAsync(
        encrypted,
        aesKey,
        rsaKeyPair.publicKey,
      );
      expect(Array.from(decrypted)).toEqual(Array.from(plaintext));
    });

    it('round-trips empty data', async () => {
      const plaintext = new Uint8Array(0);
      const encrypted = await svc.signRsa256PssAndEncryptAesCbcAsync(
        plaintext,
        aesKey,
        rsaKeyPair.privateKey,
      );
      const decrypted = await svc.decryptAesCbcAndVerifyRsa256PssAsync(
        encrypted,
        aesKey,
        rsaKeyPair.publicKey,
      );
      expect(decrypted).toEqual(plaintext);
    });

    it('respects a caller-supplied IV', async () => {
      const plaintext = new TextEncoder().encode('deterministic');
      const iv = { value: new Uint8Array(16).fill(0xab) };

      const encrypted = await svc.signRsa256PssAndEncryptAesCbcAsync(
        plaintext,
        aesKey,
        rsaKeyPair.privateKey,
        iv,
      );
      const decrypted = await svc.decryptAesCbcAndVerifyRsa256PssAsync(
        { encryptedPayload: encrypted.encryptedPayload, iv },
        aesKey,
        rsaKeyPair.publicKey,
      );
      expect(Array.from(plaintext)).toEqual(Array.from(decrypted));
    });

    it('produces different ciphertexts when IV is random (no IV supplied)', async () => {
      const plaintext = new TextEncoder().encode('same data');
      const a = await svc.signRsa256PssAndEncryptAesCbcAsync(
        plaintext,
        aesKey,
        rsaKeyPair.privateKey,
      );
      const b = await svc.signRsa256PssAndEncryptAesCbcAsync(
        plaintext,
        aesKey,
        rsaKeyPair.privateKey,
      );
      // IVs should differ (astronomically unlikely to collide)
      expect(a.iv.value).not.toEqual(b.iv.value);
    });

    it('throws when the wrong AES key is used to decrypt', async () => {
      const plaintext = new TextEncoder().encode('wrong key test');
      const encrypted = await svc.signRsa256PssAndEncryptAesCbcAsync(
        plaintext,
        aesKey,
        rsaKeyPair.privateKey,
      );
      const otherKey = await svc.generateAesKey();
      await expect(
        svc.decryptAesCbcAndVerifyRsa256PssAsync(
          encrypted,
          otherKey,
          rsaKeyPair.publicKey,
        ),
      ).rejects.toThrow();
    });

    it('throws on signature verification failure (wrong public key)', async () => {
      const plaintext = new TextEncoder().encode('sig check');
      const encrypted = await svc.signRsa256PssAndEncryptAesCbcAsync(
        plaintext,
        aesKey,
        rsaKeyPair.privateKey,
      );
      const otherPair = await svc.generateRsaKeys();
      await expect(
        svc.decryptAesCbcAndVerifyRsa256PssAsync(
          encrypted,
          aesKey,
          otherPair.publicKey,
        ),
      ).rejects.toThrow('Signature verification failed');
    });

    it('handles binary data (not just text)', async () => {
      const binary = new Uint8Array(256).map((_, i) => i);
      const encrypted = await svc.signRsa256PssAndEncryptAesCbcAsync(
        binary,
        aesKey,
        rsaKeyPair.privateKey,
      );
      const decrypted = await svc.decryptAesCbcAndVerifyRsa256PssAsync(
        encrypted,
        aesKey,
        rsaKeyPair.publicKey,
      );
      expect(decrypted).toEqual(binary);
    });
  });

  // ---------------------------------------------------------------------------
  // RSA-OAEP encrypt / decrypt
  // ---------------------------------------------------------------------------

  describe('encryptRsaOaepSha256Async / decryptRsaOaepSha256Async', () => {
    it('round-trips short data (single chunk)', async () => {
      const plaintext = new TextEncoder().encode('short');
      const encrypted = await svc.encryptRsaOaepSha256Async(
        plaintext,
        rsaKeyPair.publicKey,
      );
      const decrypted = await svc.decryptRsaOaepSha256Async(
        encrypted,
        rsaKeyPair.privateKey,
      );
      expect(Array.from(decrypted)).toEqual(Array.from(plaintext));
    });

    it('round-trips data that requires multiple 122-byte chunks', async () => {
      // 300 bytes spans three chunks
      const plaintext = new Uint8Array(300).map((_, i) => i % 256);
      const encrypted = await svc.encryptRsaOaepSha256Async(
        plaintext,
        rsaKeyPair.publicKey,
      );
      expect(encrypted.dataChunks.length).toBe(3); // ceil(300/122) = 3
      const decrypted = await svc.decryptRsaOaepSha256Async(
        encrypted,
        rsaKeyPair.privateKey,
      );
      expect(decrypted).toEqual(plaintext);
    });

    it('round-trips data whose length is exactly one chunk boundary (122 bytes)', async () => {
      const plaintext = new Uint8Array(122).fill(0x42);
      const encrypted = await svc.encryptRsaOaepSha256Async(
        plaintext,
        rsaKeyPair.publicKey,
      );
      expect(encrypted.dataChunks.length).toBe(1);
      const decrypted = await svc.decryptRsaOaepSha256Async(
        encrypted,
        rsaKeyPair.privateKey,
      );
      expect(decrypted).toEqual(plaintext);
    });

    it('round-trips empty data', async () => {
      const plaintext = new Uint8Array(0);
      const encrypted = await svc.encryptRsaOaepSha256Async(
        plaintext,
        rsaKeyPair.publicKey,
      );
      const decrypted = await svc.decryptRsaOaepSha256Async(
        encrypted,
        rsaKeyPair.privateKey,
      );
      expect(decrypted).toEqual(plaintext);
    });

    it('produces non-empty ciphertext chunks', async () => {
      const plaintext = new TextEncoder().encode('chunk check');
      const encrypted = await svc.encryptRsaOaepSha256Async(
        plaintext,
        rsaKeyPair.publicKey,
      );
      for (const chunk of encrypted.dataChunks) {
        expect(chunk.byteLength).toBeGreaterThan(0);
      }
    });

    it('throws when decrypting with the wrong private key', async () => {
      const plaintext = new TextEncoder().encode('wrong key');
      const encrypted = await svc.encryptRsaOaepSha256Async(
        plaintext,
        rsaKeyPair.publicKey,
      );
      const otherPair = await svc.generateRsaKeys();
      await expect(
        svc.decryptRsaOaepSha256Async(encrypted, otherPair.privateKey),
      ).rejects.toThrow();
    });
  });

  // ---------------------------------------------------------------------------
  // RSA-PSS sign / verify
  // ---------------------------------------------------------------------------

  describe('signRsaPssSha256Async / verifyRsaPssSha256Async', () => {
    it('verifies a valid signature', async () => {
      const data = new TextEncoder().encode('sign me');
      const signature = await svc.signRsaPssSha256Async(
        data,
        rsaKeyPair.privateKey,
      );
      const valid = await svc.verifyRsaPssSha256Async(
        data,
        signature,
        rsaKeyPair.publicKey,
      );
      expect(valid).toBe(true);
    });

    it('returns false for a tampered payload', async () => {
      const data = new TextEncoder().encode('original');
      const signature = await svc.signRsaPssSha256Async(
        data,
        rsaKeyPair.privateKey,
      );
      const tampered = new TextEncoder().encode('tampered');
      const valid = await svc.verifyRsaPssSha256Async(
        tampered,
        signature,
        rsaKeyPair.publicKey,
      );
      expect(valid).toBe(false);
    });

    it('returns false for a tampered signature', async () => {
      const data = new TextEncoder().encode('original');
      const signature = await svc.signRsaPssSha256Async(
        data,
        rsaKeyPair.privateKey,
      );
      signature[0]! ^= 0xff; // flip bits in first byte
      const valid = await svc.verifyRsaPssSha256Async(
        data,
        signature,
        rsaKeyPair.publicKey,
      );
      expect(valid).toBe(false);
    });

    it('returns false when the wrong public key is used', async () => {
      const data = new TextEncoder().encode('keypair mismatch');
      const signature = await svc.signRsaPssSha256Async(
        data,
        rsaKeyPair.privateKey,
      );
      const otherPair = await svc.generateRsaKeys();
      const valid = await svc.verifyRsaPssSha256Async(
        data,
        signature,
        otherPair.publicKey,
      );
      expect(valid).toBe(false);
    });

    it('produces a 256-byte signature (2048-bit RSA)', async () => {
      const data = new TextEncoder().encode('size check');
      const signature = await svc.signRsaPssSha256Async(
        data,
        rsaKeyPair.privateKey,
      );
      expect(signature.byteLength).toBe(256);
    });
  });

  describe('toJsonBytes / fromJsonBytes', () => {
    it('round-trips a simple object', () => {
      const obj = { a: 1, b: 'hello' };
      expect(fromJsonBytes(toJsonBytes(obj))).toEqual(obj);
    });

    it('round-trips an array', () => {
      const arr = [1, 'two', true, null];
      expect(fromJsonBytes(toJsonBytes(arr))).toEqual(arr);
    });

    it('round-trips a nested object', () => {
      const obj = { x: { y: { z: 42 } } };
      expect(fromJsonBytes(toJsonBytes(obj))).toEqual(obj);
    });

    it('round-trips a string', () => {
      expect(fromJsonBytes(toJsonBytes('hello'))).toBe('hello');
    });

    it('round-trips a number', () => {
      expect(fromJsonBytes(toJsonBytes(123.456))).toBe(123.456);
    });

    it('round-trips null', () => {
      expect(fromJsonBytes(toJsonBytes(null))).toBeNull();
    });

    it('round-trips a boolean', () => {
      expect(fromJsonBytes(toJsonBytes(true))).toBe(true);
    });

    it('encodes to UTF-8 bytes', () => {
      const result = toJsonBytes({ a: 1 });
      expect(new TextDecoder().decode(result)).toBe('{"a":1}');
    });

    it('handles unicode correctly', () => {
      const obj = { text: '日本語 émoji 🎉' };
      expect(fromJsonBytes(toJsonBytes(obj))).toEqual(obj);
    });
  });
});
