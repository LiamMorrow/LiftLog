import { uuid } from '@/utils/uuid';
import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ChatMessage {
  from: 'User' | 'System';
  message: string;
  id: string;
}

const initialState: AppState = {
  isHydrated: false,
  plannerChat: [
    {
      from: 'System' as const,
      message:
        'I am a helpful chatbot designed to generate a plan tuned to your goals and current experience level.',
    },
    {
      from: 'User' as const,
      message:
        'I am a helpful chatbot designed to generate a plan tuned to your goals and current experience level.',
    },
  ]
    .flatMap((x) => Array.from({ length: 4 }, () => ({ ...x, id: uuid() })))
    .reverse(),
};

export type AppState = {
  isHydrated: boolean;
  plannerChat: ChatMessage[];
};

const aiPlannerSlice = createSlice({
  name: 'aiPlanner',
  initialState,
  reducers: {
    setIsHydrated(state, action: PayloadAction<boolean>) {
      state.isHydrated = action.payload;
    },
    addMessage(state, action: PayloadAction<ChatMessage>) {
      state.plannerChat.unshift(action.payload);
    },
    restartChat(state) {
      state.plannerChat = [];
    },
  },
});

export const initializeAiPlannerStateSlice = createAction(
  'initializeAiPlannerStateSlice',
);

export const { setIsHydrated, addMessage, restartChat } =
  aiPlannerSlice.actions;

export const aiPlannerReducer = aiPlannerSlice.reducer;
