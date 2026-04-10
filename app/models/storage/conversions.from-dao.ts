import { google, LiftLog } from '@/gen/proto';
import { uuidStringify } from '@/utils/uuid';
import Long from 'long';
import { Duration, Instant } from '@js-joda/core';

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
    throw new Error('dao.value', { cause: e });
  }
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
