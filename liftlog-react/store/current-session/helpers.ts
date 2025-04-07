import { ExerciseBlueprint } from '@/models/blueprint-models';
import { RecordedSet } from '@/models/session-models';
import { Duration, LocalDate, LocalDateTime, LocalTime } from '@js-joda/core';
import { Draft } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { match } from 'ts-pattern';

export function getCycledRepCount(
  recordedSet: RecordedSet | undefined,
  exerciseBlueprint: ExerciseBlueprint,
): RecordedSet | undefined {
  return match(recordedSet)
    .returnType<RecordedSet | undefined>()
    .with(undefined, () => ({
      completionDateTime: LocalDateTime.now(),
      repsCompleted: exerciseBlueprint.repsPerSet,
    }))
    .with({ repsCompleted: 0 }, () => undefined)
    .otherwise((x) => ({
      ...x,
      repsCompleted: x.repsCompleted - 1,
    }));
}

// Utility type to recursively unwrap WritableDraft and handle LocalDate types
export type SafeDraft<T> =
  T extends Draft<LocalDate>
    ? // If the type is LocalDate, return LocalDate (since it's immutable)
      LocalDate
    : T extends Draft<LocalDateTime>
      ? // If the type is LocalDateTime, return LocalDateTime (since it's immutable)
        LocalDateTime
      : T extends (infer U)[]
        ? SafeDraft<U>[] // If the type is an array, apply SafeDraft to its elements
        : T extends Draft<BigNumber>
          ? BigNumber
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
