// These types are the serialized forms from libs which will not change and are well defined
// Therefore they do not need versioning

import {
  DateTimeFormatter,
  Duration,
  LocalDate,
  OffsetDateTime,
} from '@js-joda/core';
import BigNumber from 'bignumber.js';

export type Branded<T, TBrand extends string> = T & { _BRAND: TBrand };

export type LocalDateJSON = Branded<string, 'LocalDate'>; // ISO formatted JS Joda LocalDate

export function fromLocalDateJSON(json: LocalDateJSON): LocalDate {
  return LocalDate.parse(json, DateTimeFormatter.ISO_LOCAL_DATE);
}

export function toLocalDateJSON(value: LocalDate): LocalDateJSON {
  return value.format(DateTimeFormatter.ISO_LOCAL_DATE) as LocalDateJSON;
}

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

export type DurationJSON = Branded<string, 'Duration'>; // ISO formatted JS Joda Duration
export function fromDurationJSON(json: DurationJSON): Duration {
  return Duration.parse(json);
}

export function toDurationJSON(value: Duration): DurationJSON {
  return value.toJSON() as DurationJSON;
}

export type BigNumberJSON = Branded<string, 'BigNumber'>; // BigNumberJs decimal string format

export function fromBigNumberJSON(json: BigNumberJSON): BigNumber {
  return new BigNumber(json);
}

export function toBigNumberJSON(value: BigNumber): BigNumberJSON {
  return value.toJSON() as BigNumberJSON;
}
