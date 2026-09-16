import { Duration, OffsetDateTime } from '@js-joda/core';

export class RestTimer {
  constructor(
    readonly startedAt: OffsetDateTime,
    readonly pausedAt?: OffsetDateTime,
    readonly failedAtStart?: boolean,
  ) {}

  get isPaused(): boolean {
    return this.pausedAt !== undefined;
  }

  elapsed(now: OffsetDateTime): Duration {
    return Duration.between(this.startedAt, this.pausedAt ?? now);
  }

  pause(now: OffsetDateTime): RestTimer {
    return this.pausedAt ? this : new RestTimer(this.startedAt, now, this.failedAtStart);
  }

  resume(now: OffsetDateTime): RestTimer {
    if (!this.pausedAt) {
      return this;
    }
    return new RestTimer(this.startedAt.plus(Duration.between(this.pausedAt, now)), undefined, this.failedAtStart);
  }

  togglePause(now: OffsetDateTime): RestTimer {
    return this.pausedAt ? this.resume(now) : this.pause(now);
  }

  equals(other: RestTimer | undefined): boolean {
    return (
      !!other &&
      this.failedAtStart === other.failedAtStart &&
      this.startedAt.isEqual(other.startedAt) &&
      (this.pausedAt?.isEqual(other.pausedAt ?? OffsetDateTime.MAX) ?? other.pausedAt === undefined)
    );
  }
}
