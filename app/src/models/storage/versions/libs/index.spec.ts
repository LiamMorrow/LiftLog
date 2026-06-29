import { Duration, Instant, LocalDate, OffsetDateTime, ZoneOffset } from '@js-joda/core';
import BigNumber from 'bignumber.js';
import { describe, expect, it } from 'vitest';
import {
  AesEncryptedAndRsaSignedData,
  AesIV,
  AesKey,
  fromAesEncryptedAndRsaSignedDataJSON,
  fromAesIVJSON,
  fromAesKeyJSON,
  fromBase64Uint8ArrayJSON,
  fromBigNumberJSON,
  fromDurationJSON,
  fromInstantJson,
  fromLocalDateJSON,
  fromOffsetDateTimeJSON,
  fromRsaEncryptedDataJSON,
  fromRsaKeyPairJSON,
  fromRsaPrivateKeyJSON,
  fromRsaPublicKeyJSON,
  RsaEncryptedData,
  RsaKeyPair,
  RsaPrivateKey,
  RsaPublicKey,
  toAesEncryptedAndRsaSignedDataJSON,
  toAesIVJSON,
  toAesKeyJSON,
  toBase64Uint8ArrayJSON,
  toBigNumberJSON,
  toDurationJSON,
  toInstantJson,
  toLocalDateJSON,
  toOffsetDateTimeJSON,
  toRsaEncryptedDataJSON,
  toRsaKeyPairJSON,
  toRsaPrivateKeyJSON,
  toRsaPublicKeyJSON,
  type Base64Uint8ArrayJSON,
  type BigNumberJSON,
  type DurationJSON,
  type InstantJSON,
  type LocalDateJSON,
  type OffsetDateTimeJSON,
} from '.';

const bytes = (vals: number[]) => new Uint8Array(vals);
const b64 = (vals: number[]) => toBase64Uint8ArrayJSON(bytes(vals));

describe('libs', () => {
  describe('LocalDateJSON', () => {
    it('round-trips a date', () => {
      const date = LocalDate.of(2024, 3, 15);
      expect(fromLocalDateJSON(toLocalDateJSON(date)).equals(date)).toBe(true);
    });

    it('serializes to ISO format', () => {
      expect(toLocalDateJSON(LocalDate.of(2024, 1, 5))).toBe('2024-01-05');
    });

    it('parses a known ISO string', () => {
      const result = fromLocalDateJSON('2024-03-15' as LocalDateJSON);
      expect(result.equals(LocalDate.of(2024, 3, 15))).toBe(true);
    });
  });

  describe('OffsetDateTimeJSON', () => {
    it('round-trips a datetime', () => {
      const dt = OffsetDateTime.of(2024, 3, 15, 10, 30, 0, 0, ZoneOffset.UTC);
      expect(fromOffsetDateTimeJSON(toOffsetDateTimeJSON(dt)).isEqual(dt)).toBe(true);
    });

    it('serializes to ISO offset format', () => {
      const dt = OffsetDateTime.of(2024, 3, 15, 10, 30, 0, 0, ZoneOffset.UTC);
      expect(toOffsetDateTimeJSON(dt)).toBe('2024-03-15T10:30:00Z');
    });

    it('parses a known ISO offset string', () => {
      const result = fromOffsetDateTimeJSON('2024-03-15T10:30:00+10:00' as OffsetDateTimeJSON);
      expect(result.offset().equals(ZoneOffset.ofHours(10))).toBe(true);
    });
  });

  describe('InstantJSON', () => {
    it('round-trips an instant', () => {
      const instant = Instant.parse('2024-03-15T10:30:00Z');
      expect(fromInstantJson(toInstantJson(instant)).equals(instant)).toBe(true);
    });

    it('serializes to ISO string', () => {
      expect(toInstantJson(Instant.parse('2024-03-15T10:30:00Z'))).toBe('2024-03-15T10:30:00Z');
    });

    it('parses a known ISO string', () => {
      const result = fromInstantJson('2024-03-15T10:30:00Z' as InstantJSON);
      expect(result.equals(Instant.parse('2024-03-15T10:30:00Z'))).toBe(true);
    });

    it('returns undefined for undefined input', () => {
      expect(fromInstantJson(undefined)).toBeUndefined();
      expect(toInstantJson(undefined)).toBeUndefined();
    });
  });

  describe('DurationJSON', () => {
    it('round-trips a duration', () => {
      const duration = Duration.ofSeconds(3661); // 1h 1m 1s
      expect(fromDurationJSON(toDurationJSON(duration)).equals(duration)).toBe(true);
    });

    it('serializes to ISO duration format', () => {
      expect(toDurationJSON(Duration.ofSeconds(90))).toBe('PT1M30S');
    });

    it('parses a known ISO duration string', () => {
      const result = fromDurationJSON('PT1M30S' as DurationJSON);
      expect(result.seconds()).toBe(90);
    });

    it('handles zero duration', () => {
      const zero = Duration.ZERO;
      expect(fromDurationJSON(toDurationJSON(zero)).isZero()).toBe(true);
    });

    it('handles negative duration', () => {
      const neg = Duration.ofSeconds(-60);
      expect(fromDurationJSON(toDurationJSON(neg)).equals(neg)).toBe(true);
    });
  });

  describe('BigNumberJSON', () => {
    it('round-trips a decimal', () => {
      const n = new BigNumber('1.23456789');
      expect(fromBigNumberJSON(toBigNumberJSON(n)).isEqualTo(n)).toBe(true);
    });

    it('preserves high precision', () => {
      const precise = new BigNumber('0.1').plus('0.2');
      const result = fromBigNumberJSON(toBigNumberJSON(precise));
      expect(result.toFixed()).toBe('0.3');
    });

    it('handles integers', () => {
      const n = new BigNumber(42);
      expect(fromBigNumberJSON(toBigNumberJSON(n)).isEqualTo(42)).toBe(true);
    });

    it('handles negative values', () => {
      const n = new BigNumber('-9999.99');
      expect(fromBigNumberJSON(toBigNumberJSON(n)).isEqualTo(n)).toBe(true);
    });

    it('serializes to decimal string', () => {
      expect(toBigNumberJSON(new BigNumber('1.23'))).toBe('1.23');
    });

    it('parses a known decimal string', () => {
      expect(fromBigNumberJSON('1.23' as BigNumberJSON).isEqualTo(new BigNumber('1.23'))).toBe(true);
    });
  });

  describe('Base64Uint8Array', () => {
    it('round-trips a byte array', () => {
      const input = new Uint8Array([1, 2, 3, 255, 0, 128]);
      expect(fromBase64Uint8ArrayJSON(toBase64Uint8ArrayJSON(input))).toEqual(input);
    });

    it('handles an empty array', () => {
      const input = new Uint8Array([]);
      expect(fromBase64Uint8ArrayJSON(toBase64Uint8ArrayJSON(input))).toEqual(input);
    });

    it('handles all-zero bytes', () => {
      const input = new Uint8Array(8);
      expect(fromBase64Uint8ArrayJSON(toBase64Uint8ArrayJSON(input))).toEqual(input);
    });

    it('handles all 256 byte values', () => {
      const input = new Uint8Array(Array.from({ length: 256 }, (_, i) => i));
      expect(fromBase64Uint8ArrayJSON(toBase64Uint8ArrayJSON(input))).toEqual(input);
    });

    it('serializes to a valid base64 string', () => {
      // [72, 101, 108, 108, 111] = "Hello"
      expect(toBase64Uint8ArrayJSON(new Uint8Array([72, 101, 108, 108, 111]))).toBe('SGVsbG8=');
    });

    it('deserializes a known base64 string', () => {
      expect(fromBase64Uint8ArrayJSON('SGVsbG8=' as Base64Uint8ArrayJSON)).toEqual(
        new Uint8Array([72, 101, 108, 108, 111]),
      );
    });
  });
  describe('RsaPublicKey', () => {
    it('round-trips', () => {
      const key: RsaPublicKey = { spkiPublicKeyBytes: bytes([1, 2, 3, 4]) };
      expect(fromRsaPublicKeyJSON(toRsaPublicKeyJSON(key))).toEqual(key);
    });

    it('deserializes spkiPublicKeyBytes from base64', () => {
      const result = fromRsaPublicKeyJSON({
        spkiPublicKeyBytes: b64([1, 2, 3, 4]),
      });
      expect(result.spkiPublicKeyBytes).toEqual(bytes([1, 2, 3, 4]));
    });

    it('serializes spkiPublicKeyBytes to base64', () => {
      const result = toRsaPublicKeyJSON({
        spkiPublicKeyBytes: bytes([1, 2, 3, 4]),
      });
      expect(result.spkiPublicKeyBytes).toBe(b64([1, 2, 3, 4]));
    });
  });

  describe('RsaPrivateKey', () => {
    it('round-trips', () => {
      const key: RsaPrivateKey = { pkcs8PrivateKeyBytes: bytes([10, 20, 30]) };
      expect(fromRsaPrivateKeyJSON(toRsaPrivateKeyJSON(key))).toEqual(key);
    });

    it('deserializes pkcs8PrivateKeyBytes from base64', () => {
      const result = fromRsaPrivateKeyJSON({
        pkcs8PrivateKeyBytes: b64([10, 20, 30]),
      });
      expect(result.pkcs8PrivateKeyBytes).toEqual(bytes([10, 20, 30]));
    });
  });

  describe('AesKey', () => {
    it('round-trips', () => {
      const key: AesKey = { value: bytes([0, 128, 255]) };
      expect(fromAesKeyJSON(toAesKeyJSON(key))).toEqual(key);
    });

    it('deserializes value from base64', () => {
      const result = fromAesKeyJSON({ value: b64([0, 128, 255]) });
      expect(result.value).toEqual(bytes([0, 128, 255]));
    });
  });

  describe('AesIV', () => {
    it('round-trips', () => {
      const iv: AesIV = {
        value: bytes([9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 11, 12]),
      };
      expect(fromAesIVJSON(toAesIVJSON(iv))).toEqual(iv);
    });

    it('deserializes value from base64', () => {
      const result = fromAesIVJSON({ value: b64([9, 8, 7]) });
      expect(result.value).toEqual(bytes([9, 8, 7]));
    });
  });

  describe('AesEncryptedAndRsaSignedData', () => {
    const sample: AesEncryptedAndRsaSignedData = {
      encryptedPayload: bytes([1, 2, 3]),
      iv: { value: bytes([4, 5, 6]) },
    };

    it('round-trips', () => {
      expect(fromAesEncryptedAndRsaSignedDataJSON(toAesEncryptedAndRsaSignedDataJSON(sample))).toEqual(sample);
    });

    it('deserializes encryptedPayload and iv', () => {
      const result = fromAesEncryptedAndRsaSignedDataJSON({
        encryptedPayload: b64([1, 2, 3]),
        iv: { value: b64([4, 5, 6]) },
      });
      expect(result.encryptedPayload).toEqual(bytes([1, 2, 3]));
      expect(result.iv.value).toEqual(bytes([4, 5, 6]));
    });

    it('serializes encryptedPayload and iv', () => {
      const result = toAesEncryptedAndRsaSignedDataJSON(sample);
      expect(result.encryptedPayload).toBe(b64([1, 2, 3]));
      expect(result.iv.value).toBe(b64([4, 5, 6]));
    });
  });

  describe('RsaEncryptedData', () => {
    const sample: RsaEncryptedData = {
      dataChunks: [bytes([1, 2]), bytes([3, 4]), bytes([5, 6])],
    };

    it('round-trips', () => {
      expect(fromRsaEncryptedDataJSON(toRsaEncryptedDataJSON(sample))).toEqual(sample);
    });

    it('deserializes each chunk from base64', () => {
      const result = fromRsaEncryptedDataJSON({
        dataChunks: [b64([1, 2]), b64([3, 4]), b64([5, 6])],
      });
      expect(result.dataChunks).toEqual([bytes([1, 2]), bytes([3, 4]), bytes([5, 6])]);
    });

    it('handles empty dataChunks', () => {
      expect(fromRsaEncryptedDataJSON({ dataChunks: [] })).toEqual({
        dataChunks: [],
      });
    });

    it('handles a single chunk', () => {
      const single: RsaEncryptedData = { dataChunks: [bytes([255])] };
      expect(fromRsaEncryptedDataJSON(toRsaEncryptedDataJSON(single))).toEqual(single);
    });
  });

  describe('RsaKeyPair', () => {
    const sample: RsaKeyPair = {
      publicKey: { spkiPublicKeyBytes: bytes([1, 2, 3]) },
      privateKey: { pkcs8PrivateKeyBytes: bytes([4, 5, 6]) },
    };

    it('round-trips', () => {
      expect(fromRsaKeyPairJSON(toRsaKeyPairJSON(sample))).toEqual(sample);
    });

    it('deserializes both keys', () => {
      const result = fromRsaKeyPairJSON({
        publicKey: { spkiPublicKeyBytes: b64([1, 2, 3]) },
        privateKey: { pkcs8PrivateKeyBytes: b64([4, 5, 6]) },
      });
      expect(result.publicKey.spkiPublicKeyBytes).toEqual(bytes([1, 2, 3]));
      expect(result.privateKey.pkcs8PrivateKeyBytes).toEqual(bytes([4, 5, 6]));
    });
  });
});
