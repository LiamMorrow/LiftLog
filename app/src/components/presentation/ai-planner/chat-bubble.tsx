import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { View } from 'react-native';
import { ChatMessage } from '@/store/ai-planner';
import { match } from 'ts-pattern';
import { Loader } from '@/components/presentation/foundation/loader';
import { GeneralMessage } from '@/components/presentation/ai-planner/general-message';
import { PlanMessage } from '@/components/presentation/ai-planner/plan-message';
import { SharedProgramMessage } from '@/components/presentation/ai-planner/shared-program-message';
import { ProPrompt } from '@/components/presentation/ai-planner/pro-prompt';
import { UpdatePrompt } from '@/components/presentation/ai-planner/update-prompt';

export function ChatBubble(props: {
  message: ChatMessage;
  sameSenderBelow: boolean;
  sameSenderAbove: boolean;
  isLastMessage: boolean;
}) {
  const { message, sameSenderBelow, sameSenderAbove } = props;
  const isUser = message.from === 'User';
  const { colors } = useAppTheme();

  const smallRadius = spacing[1];
  const normalRadius = spacing[4];

  const topDynamicRadius = sameSenderAbove ? smallRadius : normalRadius;
  const bottomDynamicRadius = sameSenderBelow ? smallRadius : normalRadius;
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: message.from === 'User' ? 'flex-end' : 'flex-start',
      }}
    >
      <View
        style={{
          backgroundColor: isUser ? colors.primary : colors.surfaceContainerHighest,
          borderTopLeftRadius: isUser ? normalRadius : topDynamicRadius,
          borderTopRightRadius: isUser ? topDynamicRadius : normalRadius,
          borderBottomLeftRadius: isUser ? normalRadius : bottomDynamicRadius,
          borderBottomRightRadius: isUser ? bottomDynamicRadius : normalRadius,
          padding: spacing[3],
          maxWidth: '90%',
        }}
      >
        {match(message)
          .with({ type: 'messageResponse' }, (message) => <GeneralMessage isUser={isUser} message={message} />)
          .with({ type: 'chatPlan' }, (message) => <PlanMessage isUser={isUser} message={message} />)
          .with({ type: 'sharedProgram' }, (message) => <SharedProgramMessage isUser={isUser} message={message} />)
          .with({ type: 'purchasePro' }, () => <ProPrompt />)
          .with({ type: 'updateRequired' }, () => <UpdatePrompt />)
          .exhaustive()}
        {message.isLoading && <ChatLoader />}
      </View>
    </View>
  );
}

function ChatLoader() {
  return <Loader loadingText="" />;
}
