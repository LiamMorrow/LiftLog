import { AiChatResponse } from '@/models/ai-models';
import {
  addMessage,
  ChatMessage,
  initChat,
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

      dispatch(
        updateMessage({
          id: originalMessage.id,
          from: 'Agent',
          ...(latestMessage ?? originalMessage),
          isLoading: false,
        }),
      );
    },
  );
  addEffect(stopAiGenerator, async (_, { extra: { aiChatService } }) => {
    await aiChatService.stopInProgress();
  });

  addEffect(initChat, async (_, { dispatch, getState }) => {
    if (getState().aiPlanner.plannerChat.length) {
      return;
    }
    dispatch(restartChat());
  });

  addEffect(restartChat, async (_, { dispatch, extra: { aiChatService } }) => {
    await aiChatService.restartChat();
    const originalMessage: ChatMessage = {
      from: 'Agent',
      id: uuid(),
      message: '',
      type: 'messageResponse',
      isLoading: true,
    };
    dispatch(addMessage(originalMessage));
    let latestMessage: AiChatResponse | undefined = undefined;
    for await (const chatResponse of aiChatService.introduce()) {
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

    dispatch(
      updateMessage({
        id: originalMessage.id,
        from: 'Agent',
        ...(latestMessage ?? originalMessage),
        isLoading: false,
      }),
    );
  });
}
