import CardList from '@/components/presentation/foundation/card-list';
import SessionSummary from '@/components/presentation/summary/session-summary';
import SessionSummaryTitle from '@/components/presentation/summary/session-summary-title';
import SplitCardControl from '@/components/presentation/foundation/split-card-control';
import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { PageActions } from '@/components/presentation/foundation/page-actions';
import AssignmentAddIcon from '@expo/material-symbols/assignment_add.xml';
import PlayCircleIcon from '@expo/material-symbols/play_circle.xml';
import { spacing } from '@/hooks/useAppTheme';
import { SharedItem, SharedProgramBlueprint, SharedSession } from '@/models/feed-models';
import { addProgramSession, savePlan } from '@/store/program';
import { showSnackbar } from '@/store/app';
import { T, useTranslate } from '@tolgee/react';
import { View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { uuid } from '@/utils/uuid';
import { useRouter } from 'expo-router';
import { Session } from '@/models/session-models';
import { usePreferredWeightUnit } from '@/hooks/usePreferredWeightUnit';
import SessionComponent from '@/components/smart/session-component';
import { useAppSelector } from '@/store';
import { useStartWorkoutWithConfirmation } from '@/hooks/useStartWorkoutWithConfirmation';

interface SharedItemProps {
  sharedItem: SharedItem;
}

function SharedProgramBlueprintContent({ sharedItem }: { sharedItem: SharedProgramBlueprint }) {
  const program = sharedItem.programBlueprint;
  const preferredWeightUnit = usePreferredWeightUnit();

  // Convert session blueprints to sessions for display
  const sessions = program.sessions.map((sessionBlueprint) =>
    Session.getEmptySession(sessionBlueprint, preferredWeightUnit),
  );

  return (
    <View style={{ padding: spacing.pageHorizontalMargin, gap: spacing[2] }}>
      {/* Header section */}
      <View>
        <Text variant="titleLarge">{program.name}</Text>
        <Text variant="bodyMedium" style={{ opacity: 0.7 }}>
          {program.sessions.length} {program.sessions.length === 1 ? 'workout' : 'workouts'}
        </Text>
      </View>

      <View style={{ flex: 1, gap: spacing[2] }}>
        <Text variant="titleMedium">
          <T keyName="workout.all.title" />
        </Text>
        <CardList
          cardType="contained"
          items={sessions}
          renderItemContent={(session) => (
            <Card.Content>
              <SplitCardControl
                titleContent={<SessionSummaryTitle session={session} />}
                mainContent={<SessionSummary session={session} />}
              />
            </Card.Content>
          )}
          keySelector={(session) => session.id}
          emptyTemplate={
            <SurfaceText>
              <T keyName="workout.no_workouts_in_plan.message" />
            </SurfaceText>
          }
        />
      </View>
    </View>
  );
}

function SharedProgramBlueprintActions({ sharedItem }: { sharedItem: SharedProgramBlueprint }) {
  const program = sharedItem.programBlueprint;
  const dispatch = useDispatch();
  const { t } = useTranslate();
  const { push } = useRouter();

  const handleSave = () => {
    const programId = uuid();
    dispatch(
      savePlan({
        programId,
        programBlueprint: program,
      }),
    );
    push(`/settings/program-list?focusprogramId=${programId}`, {
      withAnchor: true,
    });
    dispatch(
      showSnackbar({
        text: `"${program.name}" saved to your plans`,
      }),
    );
  };

  return (
    <PageActions
      primaryKind="commit"
      primary={{
        label: t('plan.import.save.button'),
        icon: AssignmentAddIcon,
        systemImage: 'plus',
        onPress: handleSave,
      }}
    />
  );
}

function SharedSessionContent({ sharedItem }: { sharedItem: SharedSession }) {
  const showBodyweight = useAppSelector((x) => x.settings.showBodyweight);
  return <SessionComponent session={sharedItem.session} showBodyweight={showBodyweight} embedded />;
}

function SharedSessionActions({ sharedItem }: { sharedItem: SharedSession }) {
  const session = sharedItem.session;
  const dispatch = useDispatch();
  const { t } = useTranslate();
  const activeProgramId = useAppSelector((x) => x.program.activePlanId);
  const { push } = useRouter();
  const { start, confirmationDialog } = useStartWorkoutWithConfirmation();

  const saveToPlan = () => {
    dispatch(
      addProgramSession({
        programId: activeProgramId,
        sessionBlueprint: session.blueprint,
      }),
    );
    push(`/settings/manage-workouts/${activeProgramId}`);
  };

  return (
    <>
      {confirmationDialog}
      <PageActions
        primaryKind="commit"
        primary={{
          label: t('feed.shared_session.start_workout.button'),
          icon: PlayCircleIcon,
          systemImage: 'play.circle',
          onPress: () => start(session.with({ id: uuid() })),
        }}
        secondary={[
          {
            label: t('feed.shared_session.save_to_plan.button'),
            icon: AssignmentAddIcon,
            systemImage: 'plus',
            onPress: saveToPlan,
          },
        ]}
      />
    </>
  );
}

export function SharedItemActions({ sharedItem }: SharedItemProps) {
  if (sharedItem instanceof SharedProgramBlueprint) {
    return <SharedProgramBlueprintActions sharedItem={sharedItem} />;
  }
  if (sharedItem instanceof SharedSession) {
    return <SharedSessionActions sharedItem={sharedItem} />;
  }
  return null;
}

export default function SharedItemComponent({ sharedItem }: SharedItemProps) {
  if (sharedItem instanceof SharedProgramBlueprint) {
    return <SharedProgramBlueprintContent sharedItem={sharedItem} />;
  }
  if (sharedItem instanceof SharedSession) {
    return <SharedSessionContent sharedItem={sharedItem} />;
  }
  // Fallback for future shared item types
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <SurfaceText>Unsupported shared item type</SurfaceText>
    </View>
  );
}
