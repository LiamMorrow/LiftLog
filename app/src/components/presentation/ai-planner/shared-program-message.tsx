import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { spacing } from '@/hooks/useAppTheme';
import { Fragment } from 'react';
import { View } from 'react-native';
import SessionSummary from '@/components/presentation/summary/session-summary';
import SessionSummaryTitle from '@/components/presentation/summary/session-summary-title';
import { AiChatSharedProgramMessage } from '@/models/ai-models';
import { Session } from '@/models/session-models';
import { usePreferredWeightUnit } from '@/hooks/usePreferredWeightUnit';

export function SharedProgramMessage({ message, isUser }: { message: AiChatSharedProgramMessage; isUser: boolean }) {
  const preferredWeightUnit = usePreferredWeightUnit();
  const color = isUser ? 'onPrimary' : 'onSurface';
  return (
    <View style={{ gap: spacing[2] }}>
      <SurfaceText font="text-2xl" weight={'bold'} color={color}>
        {message.programName}
      </SurfaceText>
      {message.blueprint.sessions.map((s, i) => (
        <Fragment key={i}>
          <SessionSummaryTitle session={Session.getEmptySession(s, preferredWeightUnit)} color={color} />
          <SessionSummary session={Session.getEmptySession(s, preferredWeightUnit)} color={color} />
        </Fragment>
      ))}
    </View>
  );
}
