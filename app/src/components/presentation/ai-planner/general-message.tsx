import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { AiChatMessageResponse } from '@/models/ai-models';

export function GeneralMessage({
  message,
  isUser,
}: {
  message: AiChatMessageResponse;
  isUser: boolean;
}) {
  return (
    <SurfaceText color={isUser ? 'onPrimary' : 'onSurface'}>
      {message.message}
    </SurfaceText>
  );
}
