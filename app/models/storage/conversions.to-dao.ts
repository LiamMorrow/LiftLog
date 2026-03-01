import { google, LiftLog } from '@/gen/proto';
import {
  Duration,
  Instant,
  LocalDate,
  LocalTime,
  OffsetDateTime,
} from '@js-joda/core';
import BigNumber from 'bignumber.js';
import Long from 'long';
import { uuidParse } from '@/utils/uuid';

/// Shared functions for some of the core proto types which we don't have equivalent domain models for

export function toUuidDao(uuid: string): LiftLog.Ui.Models.IUuidDao {
  const parsed = uuidParse(uuid);
  // Reorder bytes to match the Guid.ToByteArray behavior in C#. See fromUuidDao
  // prettier-ignore
  const reorderedForGuid = [
    parsed[3], parsed[2], parsed[1], parsed[0],
    parsed[5], parsed[4],
    parsed[7], parsed[6],
    parsed[8], parsed[9], parsed[10], parsed[11], parsed[12], parsed[13], parsed[14], parsed[15],
  ];
  return { value: Uint8Array.from(reorderedForGuid) };
}

export function toStringValue(
  value: string | undefined | null,
): google.protobuf.IStringValue | null {
  if (value == null) {
    return null;
  }
  return { value };
}

const nanoFactor = BigNumber('1000000000');
// Converts a BigNumber to a DecimalValue DAO
export function toDecimalDao(
  number: BigNumber,
): LiftLog.Ui.Models.DecimalValue {
  const units = number.integerValue(BigNumber.ROUND_FLOOR);
  const nanos = number
    .minus(BigNumber(units))
    .multipliedBy(nanoFactor)
    .integerValue();
  return new LiftLog.Ui.Models.DecimalValue({
    units: Long.fromString(units.toString()),
    nanos: nanos.toNumber(),
  });
}

export function toTimestampDao(instant: Instant): google.protobuf.Timestamp {
  return new google.protobuf.Timestamp({
    seconds: Long.fromNumber(Math.floor(instant.toEpochMilli() / 1000)),
    // TODO we are dropping nanos
  });
}

export function toDateOnlyDao(date: LocalDate): LiftLog.Ui.Models.DateOnlyDao {
  return new LiftLog.Ui.Models.DateOnlyDao({
    year: date.year(),
    month: date.monthValue(),
    day: date.dayOfMonth(),
  });
}

export function toTimeOnlyDao(time: LocalTime): LiftLog.Ui.Models.TimeOnlyDao {
  const nano = time.nano();
  return new LiftLog.Ui.Models.TimeOnlyDao({
    hour: time.hour(),
    minute: time.minute(),
    second: time.second(),
    millisecond: Math.floor(nano / 1_000_000),
    microsecond: Math.floor((nano % 1_000_000) / 1_000),
  });
}

export function toDurationDao(
  duration: Duration | undefined,
): google.protobuf.Duration | null {
  if (!duration) {
    return null;
  }
  return new google.protobuf.Duration({
    seconds: Long.fromNumber(Math.floor(duration.seconds())),
    nanos: duration.nano(),
  });
}

// Converts a CurrentPlan to a CurrentPlan DAO

export function toDateTimeDao(
  model: OffsetDateTime | undefined,
): LiftLog.Ui.Models.DateTimeDao | null {
  if (!model) {
    return null;
  }
  return new LiftLog.Ui.Models.DateTimeDao({
    date: toDateOnlyDao(model.toLocalDate()),
    time: toTimeOnlyDao(model.toLocalTime()),
    offset: { totalSeconds: model.offset().totalSeconds() },
  });
}
