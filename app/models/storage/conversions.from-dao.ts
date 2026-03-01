import { google, LiftLog } from '@/gen/proto';
import { uuidStringify } from '@/utils/uuid';
import Long from 'long';
import { UuidConversionError } from './uuid-conversion-error';
import {
  Duration,
  Instant,
  LocalDate,
  LocalTime,
  OffsetDateTime,
  ZoneOffset,
} from '@js-joda/core';
import BigNumber from 'bignumber.js';

export function fromUuidDao(
  dao: LiftLog.Ui.Models.IUuidDao | null | undefined,
): string {
  if (!dao?.value) {
    throw new Error('UUID dao cannot be null');
  }
  const v = dao.value;
  // This is wild. We used Guid.toByteArray in c# originally. You'd think this would just keep the same order as when the bytes are printed as hex as a string, but no. From the docs:
  // Note that the order of bytes in the returned byte array is different from the string representation of a Guid value.
  // The order of the beginning four-byte group and the next two two-byte groups is reversed, whereas the order of the last two-byte group and the closing six-byte group is the same.
  //    Guid: 35918bc9-196d-40ea-9779-889d79b753f0
  //    C9 8B 91 35 6D 19 EA 40 97 79 88 9D 79 B7 53 F0
  //    Guid: 35918bc9-196d-40ea-9779-889d79b753f0 (Same as First Guid: True)
  // source: https://learn.microsoft.com/en-us/dotnet/api/system.guid.tobytearray?view=net-9.0
  // prettier-ignore
  const reorderedForGuid = [
    v[3], v[2], v[1], v[0],
    v[5], v[4],
    v[7], v[6],
    v[8],v[9],v[10],v[11],v[12],v[13],v[14],v[15]
  ];
  try {
    return uuidStringify(Uint8Array.from(reorderedForGuid));
  } catch (e) {
    throw new UuidConversionError(dao.value, { cause: e });
  }
}

const nanoFactor = BigNumber('1000000000');

// Converts a DecimalValue DAO to a BigNumber
export function fromDecimalDao(dao: LiftLog.Ui.Models.IDecimalValue): BigNumber;
export function fromDecimalDao(
  dao: LiftLog.Ui.Models.IDecimalValue | null | undefined,
): BigNumber | undefined;
export function fromDecimalDao(
  dao: LiftLog.Ui.Models.IDecimalValue | null | undefined,
): BigNumber | undefined {
  if (dao?.nanos == null || dao?.units == null) {
    return undefined;
  }
  return BigNumber(dao.units.toString()).plus(
    BigNumber(dao.nanos).div(nanoFactor),
  );
}

export function fromTimeOnlyDao(
  dao: LiftLog.Ui.Models.ITimeOnlyDao | null | undefined,
): LocalTime {
  if (!dao) {
    throw new Error('TimeOnlyDao cannot be null');
  }
  const milli = dao.millisecond;
  const micro = dao.microsecond;
  const nano = (micro ?? 0) * 1000 + (milli ?? 0) * 1000000;
  return LocalTime.of(dao.hour!, dao.minute!, dao.second!, nano);
}

export function fromDateOnlyDao(
  dao: LiftLog.Ui.Models.IDateOnlyDao | null | undefined,
): LocalDate {
  if (!dao) {
    throw new Error('DateOnlyDao cannot be null');
  }
  return LocalDate.of(dao.year!, dao.month!, dao.day!);
}

export function fromDateTimeDao(
  dao: LiftLog.Ui.Models.IDateTimeDao | null | undefined,
): OffsetDateTime | undefined {
  if (!dao) {
    return undefined;
  }
  const localDateTime = fromDateOnlyDao(dao.date).atTime(
    fromTimeOnlyDao(dao.time),
  );
  return localDateTime.atOffset(
    dao.offset
      ? ZoneOffset.ofTotalSeconds(dao.offset.totalSeconds!)
      : ZoneOffset.systemDefault().rules().offsetOfLocalDateTime(localDateTime),
  );
}

export function fromTimestampDao(
  dao: google.protobuf.ITimestamp | null | undefined,
): Instant {
  // TODO - we just drop the nanos for now
  const sec = dao?.seconds;
  if (typeof sec === 'number') {
    return Instant.ofEpochSecond(sec);
  }
  return Instant.ofEpochSecond(dao!.seconds!.toNumber());
}

export function fromDurationDao(
  duration: google.protobuf.IDuration | null | undefined,
) {
  if (!duration) {
    return undefined;
  }
  return Duration.ofSeconds(
    Long.fromValue(duration.seconds!).toNumber(),
  ).plusNanos(Long.fromValue(duration.nanos!).toNumber());
}
