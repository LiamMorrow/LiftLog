import CardList from '@/components/presentation/card-list';
import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import SessionSummary from '@/components/presentation/session-summary';
import SessionSummaryTitle from '@/components/presentation/session-summary-title';
import SplitCardControl from '@/components/presentation/split-card-control';
import { SurfaceText } from '@/components/presentation/surface-text';
import { spacing } from '@/hooks/useAppTheme';
import { SharedItem, SharedProgramBlueprint } from '@/models/feed-models';
import { savePlan } from '@/store/program';
import { showSnackbar } from '@/store/app';
import { T } from '@tolgee/react';
import { View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import Button from '@/components/presentation/gesture-wrappers/button';
import { useDispatch } from 'react-redux';
import { uuid } from '@/utils/uuid';
import { useRouter } from 'expo-router';
import { Session } from '@/models/session-models';
import { usePreferredWeightUnit } from '@/hooks/usePreferredWeightUnit';

interface SharedItemProps {
  sharedItem: SharedItem;
}

function SharedProgramBlueprintContent({
  sharedItem,
}: {
  sharedItem: SharedProgramBlueprint;
}) {
  const program = sharedItem.programBlueprint;
  const dispatch = useDispatch();
  const preferredWeightUnit = usePreferredWeightUnit();
  const { push } = useRouter();

  // Convert session blueprints to sessions for display
  const sessions = program.sessions.map((sessionBlueprint) =>
    Session.getEmptySession(sessionBlueprint, preferredWeightUnit),
  );

  const handleSave = () => {
    const programId = uuid();
    dispatch(
      savePlan({
        programId,
        programBlueprint: program,
      }),
    );
    push(`/(tabs)/settings/program-list?focusprogramId=${programId}`, {
      withAnchor: true,
    });
    dispatch(
      showSnackbar({
        text: `"${program.name}" saved to your plans`,
      }),
    );
  };

  return (
    <FullHeightScrollView
      contentContainerStyle={{
        padding: spacing.pageHorizontalMargin,
        gap: spacing[2],
      }}
    >
      {/* Header section */}
      <View style={{ gap: spacing[2] }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <View style={{ flex: 1 }}>
            <Text variant="titleLarge">{program.name}</Text>
            <Text variant="bodyMedium" style={{ opacity: 0.7 }}>
              {program.sessions.length}{' '}
              {program.sessions.length === 1 ? 'workout' : 'workouts'}
            </Text>
          </View>
          <Button
            mode="contained"
            icon="save"
            style={{ alignSelf: 'center' }}
            onPress={handleSave}
          >
            <T keyName="generic.save.button" />
          </Button>
        </View>
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
    </FullHeightScrollView>
  );
}

export default function SharedItemComponent({ sharedItem }: SharedItemProps) {
  if (sharedItem instanceof SharedProgramBlueprint) {
    return <SharedProgramBlueprintContent sharedItem={sharedItem} />;
  }

  // Fallback for future shared item types
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <SurfaceText>Unsupported shared item type</SurfaceText>
    </View>
  );
}
