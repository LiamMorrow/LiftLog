import {
  ProgramBlueprintPOJO,
  SessionBlueprintPOJO,
  ExerciseBlueprintPOJO,
  Rest,
  ExerciseBlueprint,
  SessionBlueprint,
  ProgramBlueprint,
} from '@/models/session-models';
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
import {
  SessionPOJO,
  RecordedExercisePOJO,
  RecordedSetPOJO,
  PotentialSetPOJO,
  Session,
  RecordedExercise,
  RecordedSet,
  PotentialSet,
} from '@/models/session-models';
import { LocalDate, LocalDateTime, LocalTime } from '@js-joda/core';
import BigNumber from 'bignumber.js';
import fc from 'fast-check';

// Generator for BigNumber
export const BigNumberGenerator = fc
  .tuple(fc.integer(), fc.nat({ max: 1_000_000_000 }))
  .map(([whole, fractional]) => new BigNumber(`${whole}.${fractional}`));

// Generator for LocalDate
export const LocalDateGenerator = fc
  .tuple(
    fc.integer({ min: 1900, max: 2100 }),
    fc.integer({ min: 1, max: 12 }),
    fc.integer({ min: 1, max: 28 }), // Simplified to avoid invalid dates
  )
  .map(([year, month, day]) => LocalDate.of(year, month, day));

// Generator for LocalTime
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

// Generator for Rest
export const RestGenerator = fc.constantFrom(
  Rest.short,
  Rest.medium,
  Rest.long,
);

// Generator for ExerciseBlueprintPOJO
export const ExerciseBlueprintGenerator = fc
  .record<ExerciseBlueprintPOJO>({
    _BRAND: fc.constant('EXERCISE_BLUEPRINT_POJO'),
    name: fc.string(),
    sets: fc.integer({ min: 1, max: 10 }),
    repsPerSet: fc.integer({ min: 1, max: 20 }),
    weightIncreaseOnSuccess: BigNumberGenerator,
    restBetweenSets: RestGenerator,
    supersetWithNext: fc.boolean(),
    notes: fc.string(),
    link: fc.webUrl(),
  })
  .map(ExerciseBlueprint.fromPOJO);

// Generator for SessionBlueprintPOJO
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

// Generator for ProgramBlueprintPOJO
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

// Generator for RecordedSetPOJO
export const RecordedSetGenerator = fc
  .record<RecordedSetPOJO>({
    _BRAND: fc.constant('RECORDED_SET_POJO'),
    repsCompleted: fc.integer({ min: 0, max: 100 }),
    completionDateTime: LocalDateTimeGenerator,
  })
  .map(RecordedSet.fromPOJO);

// Generator for PotentialSetPOJO
export const PotentialSetGenerator = fc
  .record<PotentialSetPOJO>({
    _BRAND: fc.constant('POTENTIAL_SET_POJO'),
    set: fc.option(
      RecordedSetGenerator.map((x) => x.toPOJO()),
      {
        nil: undefined,
      },
    ),
    weight: BigNumberGenerator,
  })
  .map(PotentialSet.fromPOJO);

// Generator for RecordedExercisePOJO
export const RecordedExerciseGenerator = fc
  .record<RecordedExercisePOJO>({
    _BRAND: fc.constant('RECORDED_EXERCISE_POJO'),
    blueprint: ExerciseBlueprintGenerator.map((x) => x.toPOJO()),
    potentialSets: fc.array(
      PotentialSetGenerator.map((x) => x.toPOJO()),
      { maxLength: 10 },
    ),
    notes: fc.string(),
    perSetWeight: fc.boolean(),
  })
  .map(RecordedExercise.fromPOJO);

// Generator for SessionPOJO
export const SessionGenerator = fc
  .tuple(
    fc.record<Omit<SessionPOJO, 'recordedExercises'>>({
      _BRAND: fc.constant('SESSION_POJO'),
      id: fc.uuid(),
      blueprint: SessionBlueprintGenerator.map((x) => x.toPOJO()),
      date: LocalDateGenerator,
      bodyweight: fc.option(BigNumberGenerator, { nil: undefined }),
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

// Generator for RsaPublicKey
export const RsaPublicKeyGenerator = fc.record<RsaPublicKey>({
  spkiPublicKeyBytes: fc
    .array(fc.integer({ min: 0, max: 255 }), {
      minLength: 256,
      maxLength: 256,
    })
    .map(Buffer.from),
});

// Generator for AesKey
export const AesKeyGenerator = fc.record<AesKey>({
  value: fc
    .array(fc.integer({ min: 0, max: 255 }), {
      minLength: 32,
      maxLength: 32,
    })
    .map(Buffer.from),
});

// Generator for RsaKeyPair
export const RsaKeyPairGenerator = fc.record<RsaKeyPair>({
  publicKey: RsaPublicKeyGenerator,
  privateKey: fc.record({
    pkcs8PrivateKeyBytes: fc
      .array(fc.integer({ min: 0, max: 255 }), {
        minLength: 2048,
        maxLength: 2048,
      })
      .map(Buffer.from),
  }),
});

// Generator for FeedUserPOJO
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
        .map(Buffer.from),
      { nil: undefined },
    ),
    aesKey: fc.option(AesKeyGenerator, { nil: undefined }),
    followSecret: fc.option(fc.string(), { nil: undefined }),
  })
  .map(FeedUser.fromPOJO);

// Generator for FeedIdentityPOJO
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
        .map(Buffer.from),
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

// Generator for FollowRequestPOJO
export const FollowRequestGenerator = fc
  .record<FollowRequestPOJO>({
    _BRAND: fc.constant('FOLLOW_REQUEST_POJO'),
    userId: fc.uuid(),
    name: fc.option(fc.string(), { nil: undefined }),
  })
  .map((pojo) => new FollowRequest(pojo.userId, pojo.name));

// Generator for FollowResponsePOJO
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

// Generator for SessionFeedItemPOJO
export const SessionFeedItemGenerator = fc
  .record<SessionFeedItemPOJO>({
    _BRAND: fc.constant('FEED_ITEM_POJO'),
    userId: fc.uuid(),
    eventId: fc.uuid(),
    timestamp: LocalDateTimeGenerator,
    expiry: LocalDateTimeGenerator,
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

// Generator for RemovedSessionFeedItemPOJO
export const RemovedSessionFeedItemGenerator = fc
  .record<RemovedSessionFeedItemPOJO>({
    _BRAND: fc.constant('FEED_ITEM_POJO'),
    userId: fc.uuid(),
    eventId: fc.uuid(),
    timestamp: LocalDateTimeGenerator,
    expiry: LocalDateTimeGenerator,
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

// Generator for SharedProgramBlueprint
export const SharedProgramBlueprintGenerator = fc.record({
  program: ProgramBlueprintGenerator.map((x) => x.toPOJO()),
  sharedWith: fc.array(
    FeedUserGenerator.map((x) => x.toPOJO()),
    {
      maxLength: 10,
    },
  ),
});
