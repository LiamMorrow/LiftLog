import { AppText } from '@/components/presentation/foundation/app-text';
import { AiChatMessageResponse } from '@/models/ai-models';

export function GeneralMessage({ message, isUser }: { message: AiChatMessageResponse; isUser: boolean }) {
  return (
    <AppText variant="bodyLarge" color={isUser ? 'onPrimary' : 'onSurface'}>
      {message.message}
    </AppText>
  );
}
