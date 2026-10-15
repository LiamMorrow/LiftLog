import { describe, it, expect, beforeAll } from 'vitest';
import {
  EncryptionService,
  fromJsonBytes,
  joinNonceAndCiphertext,
  splitNonceAndCiphertext,
  toJsonBytes,
} from './encryption-service';
import type { AesEncryptedAndRsaSignedData, AesKey, RsaKeyPair } from '@/models/encryption-models';
import { Base64Uint8ArrayJSON, fromAesKeyJSON } from '@/models/storage/versions/libs';

describe('EncryptionService', () => {
  let svc: EncryptionService;
  let rsaKeyPair: RsaKeyPair;

  beforeAll(async () => {
    svc = new EncryptionService();
    rsaKeyPair = await svc.generateRsaKeys();
  });

  // ---------------------------------------------------------------------------
  // AES key generation
  // ---------------------------------------------------------------------------

  describe('generateAesKey', () => {
    it('returns a 16-byte (128-bit) AES-GCM key by default', async () => {
      const key = await svc.generateAesKey();
      expect(key.algorithm).toBe('AES-GCM');
      expect(key.value).toBeInstanceOf(Uint8Array);
      expect(key.value.byteLength).toBe(16);
    });

    it('returns a 16-byte AES-CBC key when asked for one', async () => {
      const key = await svc.generateAesKey('AES-CBC');
      expect(key.algorithm).toBe('AES-CBC');
      expect(key.value.byteLength).toBe(16);
    });

    it('produces a different key on each call', async () => {
      const [a, b] = await Promise.all([svc.generateAesKey(), svc.generateAesKey()]);
      expect(a.value).not.toEqual(b.value);
    });
  });

  // ---------------------------------------------------------------------------
  // RSA key generation
  // ---------------------------------------------------------------------------

  describe('generateRsaKeys', () => {
    it('returns non-empty PKCS8 private key bytes', () => {
      expect(rsaKeyPair.privateKey.pkcs8PrivateKeyBytes).toBeInstanceOf(Uint8Array);
      expect(rsaKeyPair.privateKey.pkcs8PrivateKeyBytes.byteLength).toBeGreaterThan(0);
    });

    it('returns non-empty SPKI public key bytes', () => {
      expect(rsaKeyPair.publicKey.spkiPublicKeyBytes).toBeInstanceOf(Uint8Array);
      expect(rsaKeyPair.publicKey.spkiPublicKeyBytes.byteLength).toBeGreaterThan(0);
    });

    it('produces a different key pair on each call', async () => {
      const second = await svc.generateRsaKeys();
      expect(rsaKeyPair.privateKey.pkcs8PrivateKeyBytes).not.toEqual(second.privateKey.pkcs8PrivateKeyBytes);
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
  // AES encrypt / decrypt (via the signed+encrypted round-trip)
  // ---------------------------------------------------------------------------

  describe.each([
    { algorithm: 'AES-GCM' as const, ivLength: 12 },
    { algorithm: 'AES-CBC' as const, ivLength: 16 },
  ])('signAndEncryptAsync / decryptAndVerifyAsync with $algorithm', ({ algorithm, ivLength }) => {
    let key: AesKey;

    beforeAll(async () => {
      key = await svc.generateAesKey(algorithm);
    });

    it('round-trips arbitrary data', async () => {
      const plaintext = new TextEncoder().encode('hello liftlog');
      const encrypted = await svc.signAndEncryptAsync(plaintext, key, rsaKeyPair.privateKey);
      const decrypted = await svc.decryptAndVerifyAsync(encrypted, key, rsaKeyPair.publicKey);
      expect(Array.from(decrypted)).toEqual(Array.from(plaintext));
    });

    it('round-trips empty data', async () => {
      const plaintext = new Uint8Array(0);
      const encrypted = await svc.signAndEncryptAsync(plaintext, key, rsaKeyPair.privateKey);
      const decrypted = await svc.decryptAndVerifyAsync(encrypted, key, rsaKeyPair.publicKey);
      expect(decrypted).toEqual(plaintext);
    });

    it('handles binary data (not just text)', async () => {
      const binary = new Uint8Array(256).map((_, i) => i);
      const encrypted = await svc.signAndEncryptAsync(binary, key, rsaKeyPair.privateKey);
      const decrypted = await svc.decryptAndVerifyAsync(encrypted, key, rsaKeyPair.publicKey);
      expect(decrypted).toEqual(binary);
    });

    it(`draws a fresh ${ivLength}-byte IV for every encryption`, async () => {
      const plaintext = new TextEncoder().encode('same data');
      const a = await svc.signAndEncryptAsync(plaintext, key, rsaKeyPair.privateKey);
      const b = await svc.signAndEncryptAsync(plaintext, key, rsaKeyPair.privateKey);
      expect(a.iv.value.byteLength).toBe(ivLength);
      expect(a.iv.value).not.toEqual(b.iv.value);
    });

    it('throws when the wrong AES key is used to decrypt', async () => {
      const plaintext = new TextEncoder().encode('wrong key test');
      const encrypted = await svc.signAndEncryptAsync(plaintext, key, rsaKeyPair.privateKey);
      const otherKey = await svc.generateAesKey(algorithm);
      await expect(svc.decryptAndVerifyAsync(encrypted, otherKey, rsaKeyPair.publicKey)).rejects.toThrow();
    });

    it('throws on signature verification failure (wrong public key)', async () => {
      const plaintext = new TextEncoder().encode('sig check');
      const encrypted = await svc.signAndEncryptAsync(plaintext, key, rsaKeyPair.privateKey);
      const otherPair = await svc.generateRsaKeys();
      await expect(svc.decryptAndVerifyAsync(encrypted, key, otherPair.publicKey)).rejects.toThrow(
        'Signature verification failed',
      );
    });

    it('throws when the key bytes are read as the other algorithm', async () => {
      const plaintext = new TextEncoder().encode('mode check');
      const encrypted = await svc.signAndEncryptAsync(plaintext, key, rsaKeyPair.privateKey);
      const otherAlgorithm = algorithm === 'AES-GCM' ? 'AES-CBC' : 'AES-GCM';
      await expect(
        svc.decryptAndVerifyAsync(encrypted, { ...key, algorithm: otherAlgorithm }, rsaKeyPair.publicKey),
      ).rejects.toThrow();
    });
  });

  describe('AES-GCM tamper detection', () => {
    let key: AesKey;
    let encrypted: AesEncryptedAndRsaSignedData;

    beforeAll(async () => {
      key = await svc.generateAesKey('AES-GCM');
      encrypted = await svc.signAndEncryptAsync(new TextEncoder().encode('do not touch'), key, rsaKeyPair.privateKey);
    });

    const flip = (bytes: Uint8Array, index: number) => bytes.map((x, i) => (i === index ? x ^ 0x01 : x));

    it.each([
      ['a ciphertext byte', () => ({ ...encrypted, encryptedPayload: flip(encrypted.encryptedPayload, 0) })],
      [
        'a tag byte',
        () => ({
          ...encrypted,
          encryptedPayload: flip(encrypted.encryptedPayload, encrypted.encryptedPayload.length - 1),
        }),
      ],
      ['a nonce byte', () => ({ ...encrypted, iv: { value: flip(encrypted.iv.value, 0) } })],
      ['a truncated tag', () => ({ ...encrypted, encryptedPayload: encrypted.encryptedPayload.slice(0, -1) })],
    ])('rejects %s', async (_, tampered: () => AesEncryptedAndRsaSignedData) => {
      await expect(svc.decryptAndVerifyAsync(tampered(), key, rsaKeyPair.publicKey)).rejects.toThrow();
    });
  });

  describe('decryptAndVerifyAsync with an unknown algorithm', () => {
    it('rejects rather than guessing', async () => {
      const key = await svc.generateAesKey();
      const encrypted = await svc.signAndEncryptAsync(new Uint8Array([1]), key, rsaKeyPair.privateKey);
      const unknown = { ...key, algorithm: 'AES-SIV' } as unknown as AesKey;
      await expect(svc.decryptAndVerifyAsync(encrypted, unknown, rsaKeyPair.publicKey)).rejects.toThrow();
    });
  });

  describe('signAndEncryptWithCbcIvAsync', () => {
    it('respects a caller-supplied IV', async () => {
      const key = await svc.generateAesKey('AES-CBC');
      const plaintext = new TextEncoder().encode('deterministic');
      const iv = { value: new Uint8Array(16).fill(0xab) };

      const encrypted = await svc.signAndEncryptWithCbcIvAsync(plaintext, key, rsaKeyPair.privateKey, iv);
      expect(encrypted.iv).toEqual(iv);
      const decrypted = await svc.decryptAndVerifyAsync(
        { encryptedPayload: encrypted.encryptedPayload, iv },
        key,
        rsaKeyPair.publicKey,
      );
      expect(Array.from(decrypted)).toEqual(Array.from(plaintext));
    });

    it('refuses an AES-GCM key, where reusing a nonce is fatal', async () => {
      const key = await svc.generateAesKey('AES-GCM');
      await expect(svc.signAndEncryptWithCbcIvAsync(new Uint8Array([1]), key, rsaKeyPair.privateKey)).rejects.toThrow();
    });
  });

  describe('a payload published before keys recorded their algorithm', () => {
    const fixture = {
      key: '7T3cGxlN0ctyJv0Ok7c4iQ==',
      iv: 'QsZJA0vbHDmQAeJq6m56Mw==',
      publicKey:
        'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwHVzGViQK6eZbOGpC4PjRPUoKsUje/SqMi1Tep9lu+hfbZvRE0XxgucnDj/8xeTtkSvI+F0lrwe/4puhwT3S7WQmxe8UOvpwgUu1++258/1G05UQxQOAyOiO+TXyrahu2mk3WNYpOwPMKz4GvBT/2IHGg8nI9w6rRCmC6rRh6qwe1YrECK8LSGxeil2HeLgDTiC9PgERt+BE6RPLKs5uh3b+rgbUSAeCkQEs4FcnnnxKKoAx2//czCMQj+i8oVaPRP4TXwPCQQgWbOPIKnegR542w4Jdup9rlB0kbZOaDbUeRbcDUcjD9rkpLbK3a69lVjxmaBSarXfAZjr5Nkw4gQIDAQAB',
      encryptedPayload:
        'Jjh6QpI/XDDvJB+Cqgc/DiNR4cgT0t0fBY8U344/uHhKO8kyz93XTG5OtMU4Pgs7O8md/feb8OujaN8fHaQIHf6kPhLWGn/fDH0Z8KABBo04mCccR9L31g+ZJ2OZmEIhbZv+T1hCKtu/MfCSRtYP6hlQcJin+objSPyhfTVEqd4GhBTI+fS8p0H1tqjhaRLO8Hbx7dL+y5voaXgLFsZwv+YkADIVpuXvZSGkbZMy86ig7z5JXoZ3XA+hylp2boGkMIDikWeYEHQk5IpOh1501EkP79r/94FG5DZxoNi+FVozAorxsNPnDs3yeUwVIUacgWpZvufA8bLOxof9YOdztj0mjhPy+KAarQI1K1z3YaMaS419k7YthajyEb7jexlFzNKcJHnDw3sf4mGwh16udT4O8UsncHLN7HO279FdqjQ=',
      plaintext: '{"type":"SessionUserEvent","note":"made before AES-GCM"}',
    };
    const bytes = (b64: string) => new Uint8Array(Buffer.from(b64, 'base64'));

    it('still decrypts with the stored key read as AES-CBC', async () => {
      const decrypted = await svc.decryptAndVerifyAsync(
        { encryptedPayload: bytes(fixture.encryptedPayload), iv: { value: bytes(fixture.iv) } },
        fromAesKeyJSON({ value: fixture.key as Base64Uint8ArrayJSON }),
        { spkiPublicKeyBytes: bytes(fixture.publicKey) },
      );
      expect(new TextDecoder().decode(decrypted)).toBe(fixture.plaintext);
    });
  });

  describe('joinNonceAndCiphertext / splitNonceAndCiphertext', () => {
    it('round-trips an AES-GCM payload through one field', async () => {
      const key = await svc.generateAesKey('AES-GCM');
      const plaintext = new TextEncoder().encode('one field');
      const encrypted = await svc.signAndEncryptAsync(plaintext, key, rsaKeyPair.privateKey);

      const split = splitNonceAndCiphertext(joinNonceAndCiphertext(encrypted));

      expect(split).toEqual(encrypted);
      const decrypted = await svc.decryptAndVerifyAsync(split, key, rsaKeyPair.publicKey);
      expect(Array.from(decrypted)).toEqual(Array.from(plaintext));
    });
  });

  // ---------------------------------------------------------------------------
  // RSA-OAEP encrypt / decrypt
  // ---------------------------------------------------------------------------

  describe('encryptRsaOaepSha256Async / decryptRsaOaepSha256Async', () => {
    it('round-trips short data (single chunk)', async () => {
      const plaintext = new TextEncoder().encode('short');
      const encrypted = await svc.encryptRsaOaepSha256Async(plaintext, rsaKeyPair.publicKey);
      const decrypted = await svc.decryptRsaOaepSha256Async(encrypted, rsaKeyPair.privateKey);
      expect(Array.from(decrypted)).toEqual(Array.from(plaintext));
    });

    it('round-trips data that requires multiple 122-byte chunks', async () => {
      // 300 bytes spans three chunks
      const plaintext = new Uint8Array(300).map((_, i) => i % 256);
      const encrypted = await svc.encryptRsaOaepSha256Async(plaintext, rsaKeyPair.publicKey);
      expect(encrypted.dataChunks.length).toBe(3); // ceil(300/122) = 3
      const decrypted = await svc.decryptRsaOaepSha256Async(encrypted, rsaKeyPair.privateKey);
      expect(decrypted).toEqual(plaintext);
    });

    it('round-trips data whose length is exactly one chunk boundary (122 bytes)', async () => {
      const plaintext = new Uint8Array(122).fill(0x42);
      const encrypted = await svc.encryptRsaOaepSha256Async(plaintext, rsaKeyPair.publicKey);
      expect(encrypted.dataChunks.length).toBe(1);
      const decrypted = await svc.decryptRsaOaepSha256Async(encrypted, rsaKeyPair.privateKey);
      expect(decrypted).toEqual(plaintext);
    });

    it('round-trips empty data', async () => {
      const plaintext = new Uint8Array(0);
      const encrypted = await svc.encryptRsaOaepSha256Async(plaintext, rsaKeyPair.publicKey);
      const decrypted = await svc.decryptRsaOaepSha256Async(encrypted, rsaKeyPair.privateKey);
      expect(decrypted).toEqual(plaintext);
    });

    it('produces non-empty ciphertext chunks', async () => {
      const plaintext = new TextEncoder().encode('chunk check');
      const encrypted = await svc.encryptRsaOaepSha256Async(plaintext, rsaKeyPair.publicKey);
      for (const chunk of encrypted.dataChunks) {
        expect(chunk.byteLength).toBeGreaterThan(0);
      }
    });

    it('throws when decrypting with the wrong private key', async () => {
      const plaintext = new TextEncoder().encode('wrong key');
      const encrypted = await svc.encryptRsaOaepSha256Async(plaintext, rsaKeyPair.publicKey);
      const otherPair = await svc.generateRsaKeys();
      await expect(svc.decryptRsaOaepSha256Async(encrypted, otherPair.privateKey)).rejects.toThrow();
    });
  });

  // ---------------------------------------------------------------------------
  // RSA-PSS sign / verify
  // ---------------------------------------------------------------------------

  describe('signRsaPssSha256Async / verifyRsaPssSha256Async', () => {
    it('verifies a valid signature', async () => {
      const data = new TextEncoder().encode('sign me');
      const signature = await svc.signRsaPssSha256Async(data, rsaKeyPair.privateKey);
      const valid = await svc.verifyRsaPssSha256Async(data, signature, rsaKeyPair.publicKey);
      expect(valid).toBe(true);
    });

    it('returns false for a tampered payload', async () => {
      const data = new TextEncoder().encode('original');
      const signature = await svc.signRsaPssSha256Async(data, rsaKeyPair.privateKey);
      const tampered = new TextEncoder().encode('tampered');
      const valid = await svc.verifyRsaPssSha256Async(tampered, signature, rsaKeyPair.publicKey);
      expect(valid).toBe(false);
    });

    it('returns false for a tampered signature', async () => {
      const data = new TextEncoder().encode('original');
      const signature = await svc.signRsaPssSha256Async(data, rsaKeyPair.privateKey);
      signature[0]! ^= 0xff; // flip bits in first byte
      const valid = await svc.verifyRsaPssSha256Async(data, signature, rsaKeyPair.publicKey);
      expect(valid).toBe(false);
    });

    it('returns false when the wrong public key is used', async () => {
      const data = new TextEncoder().encode('keypair mismatch');
      const signature = await svc.signRsaPssSha256Async(data, rsaKeyPair.privateKey);
      const otherPair = await svc.generateRsaKeys();
      const valid = await svc.verifyRsaPssSha256Async(data, signature, otherPair.publicKey);
      expect(valid).toBe(false);
    });

    it('produces a 256-byte signature (2048-bit RSA)', async () => {
      const data = new TextEncoder().encode('size check');
      const signature = await svc.signRsaPssSha256Async(data, rsaKeyPair.privateKey);
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
