import { SessionBlueprint } from '@/models/blueprint-models';

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

export interface AiWorkoutPlan {
  name: string;
  description: string;
  sessions: SessionBlueprint[];
}
