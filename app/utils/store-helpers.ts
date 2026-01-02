import { Weight } from '@/models/weight';
import {
  LocalDate,
  LocalDateTime,
  LocalTime,
  Duration,
  OffsetDateTime,
} from '@js-joda/core';
import { Draft } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';

// Utility type to recursively unwrap WritableDraft and handle immutable types
export type SafeDraft<T> =
  T extends Draft<LocalDate>
    ? LocalDate
    : T extends Draft<LocalDateTime>
      ? LocalDateTime
      : T extends Draft<OffsetDateTime>
        ? OffsetDateTime
        : T extends (infer U)[]
          ? SafeDraft<U>[] // If the type is an array, apply SafeDraft to its elements
          : T extends Draft<BigNumber>
            ? BigNumber
            : T extends Draft<Weight>
              ? Weight
              : T extends Draft<LocalTime>
                ? LocalTime
                : T extends Duration
                  ? Duration
                  : T extends object
                    ? { -readonly [K in keyof T]: SafeDraft<T[K]> } // Recursively apply SafeDraft to all properties of the object
                    : T; // If the type is primitive or non-object, return the type as-is

export function toSafeDraft<T>(draft: Draft<T>): SafeDraft<T> {
  return draft as SafeDraft<T>;
}
