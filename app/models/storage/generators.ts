import {
  ProgramBlueprintPOJO,
  SessionBlueprintPOJO,
  WeightedExerciseBlueprintPOJO,
  Rest,
  WeightedExerciseBlueprint,
  SessionBlueprint,
  ProgramBlueprint,
} from '@/models/blueprint-models';
import { RsaPublicKey, AesKey, RsaKeyPair } from '@/models/encryption-models';
import {
  FeedUserPOJO,
  FeedUser,
  FeedIdentityPOJO,
  FeedIdentity,
  FollowRequestPOJO,
  FollowRequest,
  FollowResponsePOJO,
  FollowResponse,
  SessionFeedItemPOJO,
  SessionFeedItem,
  RemovedSessionFeedItemPOJO,
  RemovedSessionFeedItem,
} from '@/models/feed-models';
import { Weight, WeightUnit } from '@/models/weight';
import {
  SessionPOJO,
  RecordedWeightedExercisePOJO,
  RecordedSetPOJO,
  PotentialSetPOJO,
  Session,
  RecordedWeightedExercise,
  RecordedSet,
  PotentialSet,
} from '@/models/session-models';
import {
  Duration,
  LocalDate,
  LocalDateTime,
  LocalTime,
  ZoneOffset,
} from '@js-joda/core';
import BigNumber from 'bignumber.js';
import fc from 'fast-check';

export const BigNumberGenerator = fc
  .tuple(fc.integer(), fc.nat({ max: 1_000_000_000 }))
  .map(([whole, fractional]) => new BigNumber(`${whole}.${fractional}`));

export const WeightUnitGenerator = fc
  .boolean()
  .map((x) => (x ? ('kilograms' as WeightUnit) : 'pounds'));

export const WeightGenerator = fc
  .tuple(WeightUnitGenerator, BigNumberGenerator)
  .map(([unit, value]) => new Weight(value, unit));

export const LocalDateGenerator = fc
  .tuple(
    fc.integer({ min: 1900, max: 2100 }),
    fc.integer({ min: 1, max: 12 }),
    fc.integer({ min: 1, max: 28 }), // Simplified to avoid invalid dates
  )
  .map(([year, month, day]) => LocalDate.of(year, month, day));

export const DurationGenerator = fc
  .tuple(fc.integer({ min: 0 }), fc.integer({ min: 0 }))
  .map(([second, nano]) => Duration.ofSeconds(second).plusNanos(nano));

export const LocalTimeGenerator = fc
  .tuple(
    fc.integer({ min: 0, max: 23 }),
    fc.integer({ min: 0, max: 59 }),
    fc.integer({ min: 0, max: 59 }),
  )
  .map(([hour, minute, second]) => LocalTime.of(hour, minute, second));

export const LocalDateTimeGenerator = fc
  .tuple(LocalDateGenerator, LocalTimeGenerator)
  .map(([date, time]) => LocalDateTime.of(date, time));
export const InstantGenerator = LocalDateTimeGenerator.map((dt) =>
  dt.atOffset(ZoneOffset.UTC).toInstant(),
);

export const RestGenerator = fc.constantFrom(
  Rest.short,
  Rest.medium,
  Rest.long,
);

export const ExerciseBlueprintGenerator = fc
  .record<WeightedExerciseBlueprintPOJO>({
    _BRAND: fc.constant('WEIGHTED_EXERCISE_BLUEPRINT_POJO'),
    name: fc.string(),
    sets: fc.integer({ min: 1, max: 10 }),
    repsPerSet: fc.integer({ min: 1, max: 20 }),
    weightIncreaseOnSuccess: BigNumberGenerator,
    restBetweenSets: RestGenerator,
    supersetWithNext: fc.boolean(),
    notes: fc.string(),
    link: fc.webUrl(),
  })
  .map(WeightedExerciseBlueprint.fromPOJO);

export const SessionBlueprintGenerator = fc
  .record<SessionBlueprintPOJO>({
    _BRAND: fc.constant('SESSION_BLUEPRINT_POJO'),
    name: fc.string(),
    exercises: fc
      .array(ExerciseBlueprintGenerator, { maxLength: 10 })
      .map((x) => x.map((y) => y.toPOJO())),
    notes: fc.string(),
  })
  .map(SessionBlueprint.fromPOJO);

export const ProgramBlueprintGenerator = fc
  .record<ProgramBlueprintPOJO>({
    _BRAND: fc.constant('PROGRAM_BLUEPRINT_POJO'),
    name: fc.string(),
    sessions: fc
      .array(SessionBlueprintGenerator, { maxLength: 5 })
      .map((x) => x.map((y) => y.toPOJO())),
    lastEdited: LocalDateGenerator,
  })
  .map(ProgramBlueprint.fromPOJO);

export const RecordedSetGenerator = fc
  .record<RecordedSetPOJO>({
    _BRAND: fc.constant('RECORDED_SET_POJO'),
    repsCompleted: fc.integer({ min: 0, max: 100 }),
    completionDateTime: LocalDateTimeGenerator,
  })
  .map(RecordedSet.fromPOJO);

export const PotentialSetGenerator = fc
  .record<PotentialSetPOJO>({
    _BRAND: fc.constant('POTENTIAL_SET_POJO'),
    set: fc.option(
      RecordedSetGenerator.map((x) => x.toPOJO()),
      {
        nil: undefined,
      },
    ),
    weight: WeightGenerator,
  })
  .map(PotentialSet.fromPOJO);

export const RecordedExerciseGenerator = fc
  .record<RecordedWeightedExercisePOJO>({
    _BRAND: fc.constant('RECORDED_WEIGHTED_EXERCISE_POJO'),
    blueprint: ExerciseBlueprintGenerator.map((x) => x.toPOJO()),
    potentialSets: fc.array(
      PotentialSetGenerator.map((x) => x.toPOJO()),
      { maxLength: 10 },
    ),
    notes: fc.string(),
  })
  .map(RecordedWeightedExercise.fromPOJO);

export const SessionGenerator = fc
  .tuple(
    fc.record<Omit<SessionPOJO, 'recordedExercises'>>({
      _BRAND: fc.constant('SESSION_POJO'),
      id: fc.uuid(),
      blueprint: SessionBlueprintGenerator.map((x) => x.toPOJO()),
      date: LocalDateGenerator,
      bodyweight: fc.option(WeightGenerator, { nil: undefined }),
    }),
    fc.array(RecordedExerciseGenerator, { maxLength: 10 }),
  )
  .map(([session, exercises]) =>
    Session.fromPOJO({
      ...session,
      recordedExercises: exercises.map((x) => x.toPOJO()),
      blueprint: {
        ...session.blueprint,
        exercises: exercises.map((x) => x.toPOJO().blueprint),
      },
    }),
  );

export const RsaPublicKeyGenerator = fc.record<RsaPublicKey>({
  spkiPublicKeyBytes: fc
    .array(fc.integer({ min: 0, max: 255 }), {
      minLength: 256,
      maxLength: 256,
    })
    .map((arr) => Uint8Array.from(arr)),
});

export const AesKeyGenerator = fc.record<AesKey>({
  value: fc
    .array(fc.integer({ min: 0, max: 255 }), {
      minLength: 32,
      maxLength: 32,
    })
    .map((arr) => Uint8Array.from(arr)),
});

export const RsaKeyPairGenerator = fc.record<RsaKeyPair>({
  publicKey: RsaPublicKeyGenerator,
  privateKey: fc.record({
    pkcs8PrivateKeyBytes: fc
      .array(fc.integer({ min: 0, max: 255 }), {
        minLength: 2048,
        maxLength: 2048,
      })
      .map((arr) => Uint8Array.from(arr)),
  }),
});

export const FeedUserGenerator = fc
  .record<FeedUserPOJO>({
    _BRAND: fc.constant('FEED_USER_POJO'),
    id: fc.uuid(),
    publicKey: RsaPublicKeyGenerator,
    name: fc.option(fc.string(), { nil: undefined }),
    nickname: fc.option(fc.string(), { nil: undefined }),
    currentPlan: fc.array(
      SessionBlueprintGenerator.map((x) => x.toPOJO()),
      {
        maxLength: 5,
      },
    ),
    profilePicture: fc.option(
      fc
        .array(fc.integer({ min: 0, max: 255 }), { maxLength: 1024 })
        .map((arr) => Uint8Array.from(arr)),
      { nil: undefined },
    ),
    aesKey: fc.option(AesKeyGenerator, { nil: undefined }),
    followSecret: fc.option(fc.string(), { nil: undefined }),
  })
  .map(FeedUser.fromPOJO);

export const FeedIdentityGenerator = fc
  .record<FeedIdentityPOJO>({
    _BRAND: fc.constant('FEED_IDENTITY_POJO'),
    id: fc.uuid(),
    lookup: fc.string(),
    aesKey: AesKeyGenerator,
    rsaKeyPair: RsaKeyPairGenerator,
    password: fc.string(),
    name: fc.option(fc.string(), { nil: undefined }),
    profilePicture: fc.option(
      fc
        .array(fc.integer({ min: 0, max: 255 }), { maxLength: 1024 })
        .map((arr) => Uint8Array.from(arr)),
      { nil: undefined },
    ),
    publishBodyweight: fc.boolean(),
    publishPlan: fc.boolean(),
    publishWorkouts: fc.boolean(),
  })
  .map(
    (pojo) =>
      new FeedIdentity(
        pojo.id,
        pojo.lookup,
        pojo.aesKey,
        pojo.rsaKeyPair,
        pojo.password,
        pojo.name,
        pojo.profilePicture,
        pojo.publishBodyweight,
        pojo.publishPlan,
        pojo.publishWorkouts,
      ),
  );

export const FollowRequestGenerator = fc
  .record<FollowRequestPOJO>({
    _BRAND: fc.constant('FOLLOW_REQUEST_POJO'),
    userId: fc.uuid(),
    name: fc.option(fc.string(), { nil: undefined }),
  })
  .map((pojo) => new FollowRequest(pojo.userId, pojo.name));

export const FollowResponseGenerator = fc
  .record<FollowResponsePOJO>({
    _BRAND: fc.constant('FOLLOW_RESPONSE_POJO'),
    userId: fc.uuid(),
    accepted: fc.boolean(),
    aesKey: fc.option(AesKeyGenerator, { nil: undefined }),
    followSecret: fc.option(fc.string(), { nil: undefined }),
  })
  .map(
    (pojo) =>
      new FollowResponse(
        pojo.userId,
        pojo.accepted,
        pojo.aesKey,
        pojo.followSecret,
      ),
  );

export const SessionFeedItemGenerator = fc
  .record<SessionFeedItemPOJO>({
    _BRAND: fc.constant('SESSION_FEED_ITEM_POJO'),
    userId: fc.uuid(),
    eventId: fc.uuid(),
    timestamp: InstantGenerator,
    expiry: InstantGenerator,
    session: SessionGenerator.map((x) => x.toPOJO()),
  })
  .map(
    (pojo) =>
      new SessionFeedItem(
        pojo.userId,
        pojo.eventId,
        pojo.timestamp,
        pojo.expiry,
        Session.fromPOJO(pojo.session),
      ),
  );

export const RemovedSessionFeedItemGenerator = fc
  .record<RemovedSessionFeedItemPOJO>({
    _BRAND: fc.constant('REMOVED_SESSION_FEED_ITEM_POJO'),
    userId: fc.uuid(),
    eventId: fc.uuid(),
    timestamp: InstantGenerator,
    expiry: InstantGenerator,
    sessionId: fc.uuid(),
  })
  .map(
    (pojo) =>
      new RemovedSessionFeedItem(
        pojo.userId,
        pojo.eventId,
        pojo.timestamp,
        pojo.expiry,
        pojo.sessionId,
      ),
  );

export const SharedProgramBlueprintGenerator = fc.record({
  program: ProgramBlueprintGenerator.map((x) => x.toPOJO()),
  sharedWith: fc.array(
    FeedUserGenerator.map((x) => x.toPOJO()),
    {
      maxLength: 10,
    },
  ),
});
