import {
  addMessage,
  ChatMessage,
  initializeAiPlannerStateSlice,
  restartChat,
  updateMessage,
} from '@/store/ai-planner';
import { setIsHydrated } from '@/store/ai-planner';
import { addEffect } from '@/store/store';
import { uuid } from '@/utils/uuid';
import {
  LLAMA3_2_1B_QLORA,
  LLAMA3_2_TOKENIZER,
  LLAMA3_2_TOKENIZER_CONFIG,
  LLMModule,
} from 'react-native-executorch';

export function applyAiPlannerEffects() {
  addEffect(initializeAiPlannerStateSlice, async (_, { dispatch }) => {
    const printDownloadProgress = (progress: number) => {
      console.log(progress);
    };

    // Loading the model
    await LLMModule.load({
      modelSource: LLAMA3_2_1B_QLORA,
      tokenizerSource: LLAMA3_2_TOKENIZER,
      tokenizerConfigSource: LLAMA3_2_TOKENIZER_CONFIG,
      onDownloadProgressCallback: printDownloadProgress,
    });
    LLMModule.configure({
      chatConfig: {
        systemPrompt: `You only cater to requests to create gym plans.
        DO NOT get sidetracked by nutrition or weird questions. You just create workouts, possibly entire plans for weekly sessions.
        A workout can consist of exercises which are an amount of reps for an amount of sets.`,
      },
    });
    dispatch(setIsHydrated(true));
  });

  addEffect(
    addMessage,
    async ({ payload: message }, { getState, dispatch }) => {
      if (message.from === 'System') {
        return;
      }
      const originalMessage: ChatMessage = {
        from: 'System',
        id: uuid(),
        message: '',
        isLoading: true,
      };
      dispatch(addMessage(originalMessage));
      LLMModule.setTokenCallback({
        tokenCallback: (token) => {
          const currentMessage = getState().aiPlanner.plannerChat.find(
            (x) => x.id === originalMessage.id,
          );
          if (!originalMessage || !currentMessage) {
            return;
          }

          dispatch(
            updateMessage({
              id: originalMessage.id,
              message: currentMessage.message + token,
              isLoading: true,
            }),
          );
        },
      });
      const response = await LLMModule.sendMessage(message.message);
      dispatch(
        updateMessage({
          id: originalMessage.id,
          message: response.at(-1)!.content,
          isLoading: false,
        }),
      );
    },
  );
  addEffect(restartChat, async () => {
    await LLMModule.deleteMessage(0);
  });
}
