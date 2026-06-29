import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { spacing } from '@/hooks/useAppTheme';
import { T } from '@tolgee/react';
import { useRouter } from 'expo-router';
import { Fragment } from 'react';
import { View } from 'react-native';
import { useDispatch } from 'react-redux';
import Button from '@/components/presentation/foundation/gesture-wrappers/button';
import { uuid } from '@/utils/uuid';
import SessionSummary from '@/components/presentation/summary/session-summary';
import SessionSummaryTitle from '@/components/presentation/summary/session-summary-title';
import { AiChatPlanResponseV2 } from '@/models/ai-models';
import { ChatMessage } from '@/store/ai-planner';
import { savePlan } from '@/store/program';
import { Session } from '@/models/session-models';
import { usePreferredWeightUnit } from '@/hooks/usePreferredWeightUnit';

export function PlanMessage({ message, isUser }: { message: AiChatPlanResponseV2 & ChatMessage; isUser: boolean }) {
  const dispatch = useDispatch();
  const { push } = useRouter();
  const preferredWeightUnit = usePreferredWeightUnit();
  const blueprint = message.plan.blueprint;
  const saveAiPlan = () => {
    const programId = uuid();
    dispatch(
      savePlan({
        programId,
        programBlueprint: blueprint,
      }),
    );
    push(`/settings/program-list?focusprogramId=${programId}`);
  };
  return (
    <View style={{ gap: spacing[2] }}>
      <SurfaceText font="text-2xl" weight={'bold'} color={isUser ? 'onPrimary' : 'onSurface'}>
        {message.plan.name}
      </SurfaceText>
      <SurfaceText color={isUser ? 'onPrimary' : 'onSurface'}>{message.plan.description}</SurfaceText>
      {blueprint.sessions.map((s, i) => (
        <Fragment key={i}>
          <SessionSummaryTitle session={Session.getEmptySession(s, preferredWeightUnit)} />
          <SessionSummary session={Session.getEmptySession(s, preferredWeightUnit)} />
        </Fragment>
      ))}
      {!message.isLoading && (
        <View style={{ alignSelf: 'flex-end' }}>
          <Button mode="contained" icon={'assignmentAdd'} onPress={saveAiPlan}>
            <T keyName="plan.save_new.button" />
          </Button>
        </View>
      )}
    </View>
  );
}
