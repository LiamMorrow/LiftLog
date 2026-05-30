// These types are the serialized forms from libs which will not change and are well defined
// Therefore they do not need versioning

import {
  DateTimeFormatter,
  Duration,
  Instant,
  LocalDate,
  OffsetDateTime,
} from '@js-joda/core';
import BigNumber from 'bignumber.js';

export type Branded<T, TBrand extends string> = T & { _BRAND: TBrand };

/**
 * @format date
 */
export type LocalDateJSON = Branded<string, 'LocalDate'>; // ISO formatted JS Joda LocalDate

export function fromLocalDateJSON(json: LocalDateJSON): LocalDate {
  return LocalDate.parse(json, DateTimeFormatter.ISO_LOCAL_DATE);
}

export function toLocalDateJSON(value: LocalDate): LocalDateJSON {
  return value.format(DateTimeFormatter.ISO_LOCAL_DATE) as LocalDateJSON;
}

/**
 * @format date-time
 */
export type OffsetDateTimeJSON = Branded<string, 'OffsetDateTime'>; // ISO formatted JS Joda OffsetDateTime
export function fromOffsetDateTimeJSON(
  json: OffsetDateTimeJSON,
): OffsetDateTime {
  return OffsetDateTime.parse(json, DateTimeFormatter.ISO_OFFSET_DATE_TIME);
}

export function toOffsetDateTimeJSON(
  value: OffsetDateTime,
): OffsetDateTimeJSON {
  return value.format(
    DateTimeFormatter.ISO_OFFSET_DATE_TIME,
  ) as OffsetDateTimeJSON;
}

/**
 * @format instant
 */
export type InstantJSON = Branded<string, 'Instant'>; // ISO formatted JS Joda Instant
export function fromInstantJson(json: InstantJSON): Instant;
export function fromInstantJson(
  json: InstantJSON | undefined,
): Instant | undefined;
export function fromInstantJson(
  json: InstantJSON | undefined,
): Instant | undefined {
  if (!json) {
    return undefined;
  }
  return Instant.parse(json);
}

export function toInstantJson(value: Instant): InstantJSON;
export function toInstantJson(
  value: Instant | undefined,
): InstantJSON | undefined;
export function toInstantJson(
  value: Instant | undefined,
): InstantJSON | undefined {
  return value?.toJSON() as InstantJSON;
}

/**
 * @format duration
 */
export type DurationJSON = Branded<string, 'Duration'>; // ISO formatted JS Joda Duration
export function fromDurationJSON(json: DurationJSON): Duration {
  return Duration.parse(json);
}

export function toDurationJSON(value: Duration): DurationJSON {
  return value.toJSON() as DurationJSON;
}

/**
 * @format decimal
 * @example "1.23"
 */
export type BigNumberJSON = Branded<string, 'BigNumber'>; // BigNumberJs decimal string format

export function fromBigNumberJSON(json: BigNumberJSON): BigNumber {
  return new BigNumber(json);
}

export function toBigNumberJSON(value: BigNumber): BigNumberJSON {
  return value.toJSON() as BigNumberJSON;
}

export type JsonString<T> = Branded<string, 'Json'> & { _TMarker: T };

export function toJsonString<T>(value: T): JsonString<T> {
  return JSON.stringify(value) as JsonString<T>;
}
export function fromJsonString<T>(json: JsonString<T>): T {
  return JSON.parse(json) as T;
}

export type Base64Uint8ArrayJSON = Branded<string, 'Base64Uint8Array'>;

export function fromBase64Uint8ArrayJSON(
  json: Base64Uint8ArrayJSON,
): Uint8Array {
  return Uint8Array.from(atob(json), (c) => c.charCodeAt(0));
}

export function toBase64Uint8ArrayJSON(
  value: Uint8Array,
): Base64Uint8ArrayJSON {
  return btoa(
    Array.from(value, (b) => String.fromCharCode(b)).join(''),
  ) as Base64Uint8ArrayJSON;
}

export interface RsaPublicKeyJSON {
  spkiPublicKeyBytes: Base64Uint8ArrayJSON;
}

export interface AesKeyJSON {
  value: Base64Uint8ArrayJSON;
}

export interface RsaPrivateKeyJSON {
  pkcs8PrivateKeyBytes: Base64Uint8ArrayJSON;
}

export interface AesEncryptedAndRsaSignedDataJSON {
  encryptedPayload: Base64Uint8ArrayJSON;
  iv: AesIVJSON;
}

export interface RsaEncryptedDataJSON {
  dataChunks: Base64Uint8ArrayJSON[];
}

export interface RsaKeyPairJSON {
  publicKey: RsaPublicKeyJSON;
  privateKey: RsaPrivateKeyJSON;
}

export interface AesIVJSON {
  value: Base64Uint8ArrayJSON;
}

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

export function fromRsaPublicKeyJSON(json: RsaPublicKeyJSON): RsaPublicKey {
  return {
    spkiPublicKeyBytes: fromBase64Uint8ArrayJSON(json.spkiPublicKeyBytes),
  };
}
export function toRsaPublicKeyJSON(value: RsaPublicKey): RsaPublicKeyJSON {
  return {
    spkiPublicKeyBytes: toBase64Uint8ArrayJSON(value.spkiPublicKeyBytes),
  };
}

export function fromAesKeyJSON(json: AesKeyJSON): AesKey {
  return { value: fromBase64Uint8ArrayJSON(json.value) };
}
export function toAesKeyJSON(value: AesKey): AesKeyJSON {
  return { value: toBase64Uint8ArrayJSON(value.value) };
}

export function fromRsaPrivateKeyJSON(json: RsaPrivateKeyJSON): RsaPrivateKey {
  return {
    pkcs8PrivateKeyBytes: fromBase64Uint8ArrayJSON(json.pkcs8PrivateKeyBytes),
  };
}
export function toRsaPrivateKeyJSON(value: RsaPrivateKey): RsaPrivateKeyJSON {
  return {
    pkcs8PrivateKeyBytes: toBase64Uint8ArrayJSON(value.pkcs8PrivateKeyBytes),
  };
}

export function fromAesIVJSON(json: AesIVJSON): AesIV {
  return { value: fromBase64Uint8ArrayJSON(json.value) };
}
export function toAesIVJSON(value: AesIV): AesIVJSON {
  return { value: toBase64Uint8ArrayJSON(value.value) };
}

export function fromAesEncryptedAndRsaSignedDataJSON(
  json: AesEncryptedAndRsaSignedDataJSON,
): AesEncryptedAndRsaSignedData {
  return {
    encryptedPayload: fromBase64Uint8ArrayJSON(json.encryptedPayload),
    iv: fromAesIVJSON(json.iv),
  };
}
export function toAesEncryptedAndRsaSignedDataJSON(
  value: AesEncryptedAndRsaSignedData,
): AesEncryptedAndRsaSignedDataJSON {
  return {
    encryptedPayload: toBase64Uint8ArrayJSON(value.encryptedPayload),
    iv: toAesIVJSON(value.iv),
  };
}

export function fromRsaEncryptedDataJSON(
  json: RsaEncryptedDataJSON,
): RsaEncryptedData {
  return { dataChunks: json.dataChunks.map(fromBase64Uint8ArrayJSON) };
}
export function toRsaEncryptedDataJSON(
  value: RsaEncryptedData,
): RsaEncryptedDataJSON {
  return { dataChunks: value.dataChunks.map(toBase64Uint8ArrayJSON) };
}

export function fromRsaKeyPairJSON(json: RsaKeyPairJSON): RsaKeyPair {
  return {
    publicKey: fromRsaPublicKeyJSON(json.publicKey),
    privateKey: fromRsaPrivateKeyJSON(json.privateKey),
  };
}
export function toRsaKeyPairJSON(value: RsaKeyPair): RsaKeyPairJSON {
  return {
    publicKey: toRsaPublicKeyJSON(value.publicKey),
    privateKey: toRsaPrivateKeyJSON(value.privateKey),
  };
}
