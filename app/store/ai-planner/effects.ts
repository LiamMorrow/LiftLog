import { AiChatResponse } from '@/models/ai-models';
import {
  addMessage,
  ChatMessage,
  initializeAiPlannerStateSlice,
  restartChat,
  stopAiGenerator,
  updateMessage,
} from '@/store/ai-planner';
import { setIsHydrated } from '@/store/ai-planner';

import { addEffect } from '@/store/store';
import { uuid } from '@/utils/uuid';

export function applyAiPlannerEffects() {
  addEffect(initializeAiPlannerStateSlice, async (_, { dispatch }) => {
    dispatch(setIsHydrated(true));
    // TODO remove me
    dispatch(
      addMessage({
        from: 'User',
        id: uuid(),
        type: 'messageResponse',
        message: 'Gimme a plan with a single day and single exercise',
      }),
    );
  });

  addEffect(
    addMessage,
    async (
      { payload: message },
      { getState, dispatch, extra: { aiChatService } },
    ) => {
      if (message.from === 'Agent' || message.type !== 'messageResponse') {
        return;
      }
      const originalMessage: ChatMessage = {
        from: 'Agent',
        id: uuid(),
        message: '',
        type: 'messageResponse',
        isLoading: true,
      };
      dispatch(addMessage(originalMessage));
      let latestMessage: AiChatResponse | undefined = undefined;
      for await (const chatResponse of aiChatService.sendMessage(
        message.message,
      )) {
        latestMessage = chatResponse;
        dispatch(
          updateMessage({
            id: originalMessage.id,
            from: 'Agent',
            isLoading: true,
            ...chatResponse,
          }),
        );
      }
      if (latestMessage)
        dispatch(
          updateMessage({
            id: originalMessage.id,
            from: 'Agent',
            isLoading: false,
            ...latestMessage,
          }),
        );
    },
  );
  addEffect(stopAiGenerator, async (_, { extra: { aiChatService } }) => {
    await aiChatService.stopInProgress();
  });

  addEffect(restartChat, async (_, { extra: { aiChatService } }) => {
    await aiChatService.restartChat();
  });
}
