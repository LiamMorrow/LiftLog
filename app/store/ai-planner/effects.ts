import {
  addMessage,
  ChatMessage,
  initializeAiPlannerStateSlice,
  restartChat,
  stopAiGenerator,
  updateMessage,
} from '@/store/ai-planner';
import { setIsHydrated } from '@/store/ai-planner';
import {
  getStructuredOutputPrompt,
  PLAN_SCHEMA,
  PLAN_TOKEN,
} from '@/store/ai-planner/tool-schemas';
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
        A workout can consist of exercises which are an amount of reps for an amount of sets. Prefer shorter responses.
        When a user messages with "${PLAN_TOKEN}" you MUST respond in JSON format with the users question parsed. It's important you only do this when they send that message.
        \n${getStructuredOutputPrompt(PLAN_SCHEMA)}\n /no_think`,
        contextWindowLength: 20,
      },
    });
    dispatch(setIsHydrated(true));
    dispatch(
      addMessage({
        from: 'User',
        id: uuid(),
        message: 'Gimme a plan with a single day and single exercise',
      }),
    );
  });

  addEffect(
    addMessage,
    async ({ payload: message }, { getState, dispatch }) => {
      if (message.from === 'Agent') {
        return;
      }
      const originalMessage: ChatMessage = {
        from: 'Agent',
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
      await LLMModule.sendMessage(message.message);
      dispatch(
        updateMessage({
          id: originalMessage.id,
          isLoading: false,
        }),
      );
    },
  );
  addEffect(stopAiGenerator, (_, { getState }) => {
    LLMModule.interrupt();
  });
  addEffect(restartChat, async () => {
    await LLMModule.deleteMessage(0);
  });
}
