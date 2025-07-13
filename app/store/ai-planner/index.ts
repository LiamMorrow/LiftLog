import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ChatMessage {
  from: 'User' | 'System';
  message: string;
  id: string;
  isLoading?: boolean;
}

const initialState: AppState = {
  isHydrated: false,
  plannerChat: [],
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
    updateMessage(
      state,
      action: PayloadAction<{ id: string } & Partial<ChatMessage>>,
    ) {
      const messageIndex = state.plannerChat.findIndex(
        (x) => x.id === action.payload.id,
      );
      if (messageIndex !== -1) {
        state.plannerChat[messageIndex] = {
          ...state.plannerChat[messageIndex],
          ...action.payload,
        };
      }
    },
    removeMessage(state, action: PayloadAction<string>) {
      const existingMessage = state.plannerChat.findIndex(
        (x) => x.id === action.payload,
      );
      if (existingMessage === -1) {
        return;
      }
      state.plannerChat.splice(existingMessage, 1);
    },
    restartChat(state) {
      state.plannerChat = [];
    },
  },
  selectors: {
    selectIsLoadingAiPlannerMessage: (s) =>
      s.plannerChat.some((x) => x.isLoading),
  },
});

export const initializeAiPlannerStateSlice = createAction(
  'initializeAiPlannerStateSlice',
);

export const {
  setIsHydrated,
  addMessage,
  restartChat,
  removeMessage,
  updateMessage,
} = aiPlannerSlice.actions;

export const { selectIsLoadingAiPlannerMessage } = aiPlannerSlice.selectors;

export const aiPlannerReducer = aiPlannerSlice.reducer;
