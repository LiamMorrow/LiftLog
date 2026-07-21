import { Duration, LocalDate } from '@js-joda/core';
import BigNumber from 'bignumber.js';
import { AnyVersionAiPlanJSON } from '@/models/storage/versions/any';
import { aiPlanMigrations } from '@/models/storage/versions/migrations';
import { CardioExerciseBlueprint, ProgramBlueprint, WeightedExerciseBlueprint } from '@/models/blueprint-models';
import { DeepPartial } from '@/utils/types';
import {
  BigNumberJSON,
  CardioExerciseBlueprintJSON,
  CardioExerciseSetBlueprintJSON,
  CardioTargetJSON,
  DurationJSON,
  ExerciseBlueprintJSON,
  ProgramBlueprintJSON,
  ProgressiveOverloadJSON,
  RepsConfigJSON,
  RestJSON,
  SessionBlueprintJSON,
  toLocalDateJSON,
  WeightedExerciseBlueprintJSON,
} from '@/models/storage/versions/latest';
import { EmptySession } from '@/models/session-models';

export interface AiChatPlanResponse {
  type: 'chatPlan';
  plan: AiWorkoutPlan;
}

export interface AiChatMessageResponse {
  type: 'messageResponse';
  message: string;
}

export interface AiChatPurchaseProResponse {
  type: 'purchasePro';
}

export type AiChatResponse = AiChatMessageResponse | AiChatPlanResponse | AiChatPurchaseProResponse;

export interface AiPlan {
  name: string;
  description: string;
  blueprint: ProgramBlueprint;
}

export interface AiChatPlanResponseV2 {
  type: 'chatPlan';
  plan: AiPlan;
}

/**
 * Client-only chat message: an existing program the user has shared with the AI
 * as context for their requests. Never received from the hub.
 */
export interface AiChatSharedProgramMessage {
  type: 'sharedProgram';
  programName: string;
  blueprint: ProgramBlueprint;
}

/**
 * Builds the user-message text sent to the AI when sharing an existing program,
 * embedding it in the same JSON shape the create_workout_plan tool produces.
 */
export function describeSharedProgramForAi(programName: string, blueprint: ProgramBlueprint): string {
  return (
    `Here is my current workout program, named "${programName}". ` +
    `It uses the same JSON structure as the "blueprint" field of your create_workout_plan tool. ` +
    `Use it as the basis for my requests — when I ask for changes, return an updated plan with the create_workout_plan tool.\n\n` +
    JSON.stringify(blueprint.toJSON())
  );
}

/**
 * Sent by the hub when this app's AI plan version is behind the server's: the
 * app can't understand plans the server produces and must be updated.
 */
export interface AiChatUpdateRequiredResponse {
  type: 'updateRequired';
  requiredVersion: number;
}

export type AiChatResponseV2 =
  | AiChatMessageResponse
  | AiChatPlanResponseV2
  | AiChatUpdateRequiredResponse
  | AiChatPurchaseProResponse;

/** Wire shape received from the hub for a plan (matches backend `AiChatPlanResponseV2`). */
export type AiChatPlanResponseV2Json = AnyVersionAiPlanJSON & {
  type: 'chatPlan';
};

export type AiChatResponseV2Json =
  | AiChatMessageResponse
  | AiChatPlanResponseV2Json
  | AiChatUpdateRequiredResponse
  | AiChatPurchaseProResponse;

const emptySessionBlueprint = EmptySession.blueprint.toJSON();
const emptyWeightedExercise = WeightedExerciseBlueprint.empty().toJSON();
const emptyCardioExercise = CardioExerciseBlueprint.empty().toJSON();
const emptyCardioSet = emptyCardioExercise.sets[0]!;
const defaultIncreaseAmount = '2.5' as BigNumberJSON;
const defaultReps = emptyWeightedExercise.repsConfig.type === 'fixed' ? emptyWeightedExercise.repsConfig.reps : 10;

function fillRest(partial: DeepPartial<RestJSON> = {}): RestJSON {
  const { restBetweenSets } = emptyWeightedExercise;
  return {
    minRest: partial.minRest ?? restBetweenSets.minRest,
    maxRest: partial.maxRest ?? restBetweenSets.maxRest,
    failureRest: partial.failureRest ?? restBetweenSets.failureRest,
  };
}

function fillProgressiveOverload(partial: DeepPartial<ProgressiveOverloadJSON> = {}): ProgressiveOverloadJSON {
  switch (partial.type) {
    case 'IncreaseAllEvenlyProgressiveOverload':
      return {
        type: partial.type,
        amount: partial.amount ?? defaultIncreaseAmount,
      };
    case 'IncreaseLowestSetProgressiveOverload':
      return {
        type: partial.type,
        amount: partial.amount ?? defaultIncreaseAmount,
        increaseStrategy: partial.increaseStrategy ?? 'all',
      };
    default:
      return { type: 'NoProgressiveOverload' };
  }
}

function fillRepsConfig(partial: DeepPartial<RepsConfigJSON> = {}): RepsConfigJSON {
  switch (partial.type) {
    case 'range':
      return { type: 'range', min: partial.min ?? 8, max: partial.max ?? 12 };
    case 'perSet':
      return {
        type: 'perSet',
        targets: (partial.targets ?? []).map((t) => ({ min: t?.min ?? defaultReps, max: t?.max ?? defaultReps })),
      };
    default:
      return { type: 'fixed', reps: (partial as { reps?: number }).reps ?? defaultReps };
  }
}

function fillWeightedExercise(partial: DeepPartial<WeightedExerciseBlueprintJSON> = {}): WeightedExerciseBlueprintJSON {
  return {
    type: 'WeightedExerciseBlueprint',
    name: partial.name ?? emptyWeightedExercise.name,
    sets: partial.sets ?? emptyWeightedExercise.sets,
    repsConfig: fillRepsConfig(partial.repsConfig),
    restBetweenSets: fillRest(partial.restBetweenSets),
    supersetWithNext: partial.supersetWithNext ?? emptyWeightedExercise.supersetWithNext,
    notes: partial.notes ?? emptyWeightedExercise.notes,
    link: partial.link ?? emptyWeightedExercise.link,
    progressiveOverload: fillProgressiveOverload(partial.progressiveOverload),
    usesBodyweight: partial.usesBodyweight ?? emptyWeightedExercise.usesBodyweight,
  };
}

function fillCardioTarget(partial: DeepPartial<CardioTargetJSON> = {}): CardioTargetJSON {
  switch (partial.type) {
    case 'distance':
      return {
        type: 'distance',
        value: {
          value: partial.value?.value ?? ('0' as BigNumberJSON),
          unit: partial.value?.unit ?? 'kilometre',
        },
      };
    case 'time':
      return {
        type: 'time',
        value: partial.value ?? ('PT30M' as DurationJSON),
      };
    default:
      return emptyCardioSet.target;
  }
}

function fillCardioSet(partial: DeepPartial<CardioExerciseSetBlueprintJSON> = {}): CardioExerciseSetBlueprintJSON {
  return {
    target: fillCardioTarget(partial.target),
    trackDuration: partial.trackDuration ?? emptyCardioSet.trackDuration,
    trackDistance: partial.trackDistance ?? emptyCardioSet.trackDistance,
    trackResistance: partial.trackResistance ?? emptyCardioSet.trackResistance,
    trackIncline: partial.trackIncline ?? emptyCardioSet.trackIncline,
    trackWeight: partial.trackWeight ?? emptyCardioSet.trackWeight,
    trackSteps: partial.trackSteps ?? emptyCardioSet.trackSteps,
  };
}

function fillCardioExercise(partial: DeepPartial<CardioExerciseBlueprintJSON> = {}): CardioExerciseBlueprintJSON {
  const sets = (partial.sets ?? []).map(fillCardioSet);
  return {
    type: 'CardioExerciseBlueprint',
    name: partial.name ?? emptyCardioExercise.name,
    sets: sets.length ? sets : [fillCardioSet()],
    notes: partial.notes ?? emptyCardioExercise.notes,
    link: partial.link ?? emptyCardioExercise.link,
  };
}

function fillExercise(partial: DeepPartial<ExerciseBlueprintJSON> = {}): ExerciseBlueprintJSON {
  if (partial.type === 'CardioExerciseBlueprint') {
    return fillCardioExercise(partial);
  }
  return fillWeightedExercise(partial as DeepPartial<WeightedExerciseBlueprintJSON>);
}

function fillSession(partial: DeepPartial<SessionBlueprintJSON> = {}): SessionBlueprintJSON {
  return {
    version: 4,
    name: partial.name ?? emptySessionBlueprint.name,
    exercises: (partial.exercises ?? []).map(fillExercise),
    notes: partial.notes ?? emptySessionBlueprint.notes,
  };
}

function fillBlueprint(partial: DeepPartial<ProgramBlueprintJSON> = {}): ProgramBlueprintJSON {
  return {
    version: 3,
    name: partial.name ?? '',
    sessions: (partial.sessions ?? []).map(fillSession),
    lastEdited: toLocalDateJSON(LocalDate.now()),
  };
}

/**
 * Builds a complete latest {@link AiPlanJSON} from a possibly-incomplete wire
 * plan — the JSON streams top-to-bottom, so trailing fields may be missing —
 * filling any absent fields with empty defaults, then maps it into the domain
 * {@link ProgramBlueprint}.
 */
export function aiPlanFromJSON(partialJson: DeepPartial<AnyVersionAiPlanJSON>): AiPlan {
  if (!('version' in partialJson)) {
    throw new Error('Cannot parse partial json');
  }
  const plan = aiPlanMigrations.migrate(
    partialJson.version === 3
      ? {
          version: 3,
          name: partialJson.name ?? '',
          description: partialJson.description ?? '',
          // The any-version plan type no longer couples the outer version to the embedded
          // blueprint's, so `version === 3` can't narrow it — but a v3 wire plan is latest-shaped.
          blueprint: fillBlueprint(partialJson.blueprint as DeepPartial<ProgramBlueprintJSON>),
        }
      : (partialJson as AnyVersionAiPlanJSON),
  );

  return {
    name: plan.name,
    description: plan.description,
    blueprint: ProgramBlueprint.fromJSON(plan.blueprint).with({
      lastEdited: LocalDate.now(),
    }),
  };
}

interface AiSessionBlueprint {
  name: string;
  exercises: AiExerciseBlueprint[];
  notes: string;
}

export interface AiExerciseBlueprint {
  name: string;
  sets: number;
  repsPerSet: number;
  weightIncreaseOnSuccess: BigNumber;
  restBetweenSets: AiRest;
  supersetWithNext: boolean;
  notes: string;
  link: string;
}

interface AiRest {
  minRest: Duration;
  maxRest: Duration;
  failureRest: Duration;
}

export interface AiWorkoutPlan {
  name: string;
  description: string;
  sessions: AiSessionBlueprint[];
}
