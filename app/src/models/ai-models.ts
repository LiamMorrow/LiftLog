import { Duration } from '@js-joda/core';
import BigNumber from 'bignumber.js';

export interface AiChatPlanResponse {
  type: 'chatPlan';
  plan: AiWorkoutPlan;
}

export interface AiChatMessageResponse {
  type: 'messageResponse';
  message: string;
}

interface AiChatPurchaseProResponse {
  type: 'purchasePro';
}

export type AiChatResponse =
  | AiChatMessageResponse
  | AiChatPlanResponse
  | AiChatPurchaseProResponse;

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
