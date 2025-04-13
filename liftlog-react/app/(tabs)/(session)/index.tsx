import CardList from '@/components/presentation/card-list';
import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import { Remote } from '@/components/presentation/remote';
import SessionSummary from '@/components/presentation/session-summary';
import SessionSummaryTitle from '@/components/presentation/session-summary-title';
import SplitCardControl from '@/components/presentation/split-card-control';
import { SurfaceText } from '@/components/presentation/surface-text';
import { AndroidNotificationAlert } from '@/components/smart/android-notification-alert';
import { Tips } from '@/components/smart/tips';
import { spacing } from '@/hooks/useAppTheme';
import { Session } from '@/models/session-models';
import { RootState, useSelector } from '@/store';
import { T, useTranslate } from '@tolgee/react';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Button, Card, Icon } from 'react-native-paper';
import { useDispatch } from 'react-redux';

function NoUpcomingSessions() {
  const { push } = useRouter();

  const activeProgramId = useSelector(
    (s: RootState) => s.program.activeProgramId,
  );
  return (
    <View style={{ gap: spacing[2], paddingHorizontal: spacing[2] }}>
      <Card>
        <Card.Content style={{ gap: spacing[4] }}>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <SurfaceText font="text-lg">
              <T keyName="NoPlanCreated" />
            </SurfaceText>
            <Icon size={20} source={'info'} />
          </View>
          <View style={{ flexDirection: 'row', gap: spacing[2] }}>
            <Button
              mode="contained-tonal"
              icon={'add'}
              style={{ flex: 1 }}
              onPress={() =>
                push(`/settings/manage-workouts/${activeProgramId}`)
              }
            >
              <T keyName="AddWorkouts" />
            </Button>
            <Button
              mode="contained"
              style={{ flex: 1 }}
              icon={'assignment'}
              onPress={() => push(`/settings/program-list`)}
            >
              <T keyName="SelectAPlan" />
            </Button>
          </View>
        </Card.Content>
      </Card>
    </View>
  );
}

function ListUpcomingWorkouts({ upcoming }: { upcoming: readonly Session[] }) {
  const dispatch = useDispatch();
  const currentSession = useSelector(() => {});
  const [selectedSession, setSelectedSession] = useState<Session | undefined>();

  const selectSession = (session: Session) => {
    setSelectedSession(session);
  };
  return (
    <>
      <View style={{ margin: spacing[2] }}>
        <Tips />
      </View>
      <CardList
        cardType="outlined"
        items={upcoming}
        onPress={selectSession}
        renderItem={(session) => {
          return (
            <SplitCardControl
              titleContent={
                <SessionSummaryTitle
                  isFilled={Session.isStarted(session)}
                  session={session}
                />
              }
              mainContent={
                <SessionSummary session={session} isFilled={false} />
              }
            />
          );
        }}
      />
    </>
  );
}

export default function Index() {
  const dispatch = useDispatch();
  const upcomingSessions = useSelector((s) => s.program.upcomingSessions);
  const { push } = useRouter();
  const { t } = useTranslate();

  return (
    <FullHeightScrollView>
      <Stack.Screen options={{ title: t('UpcomingWorkouts') }} />
      <AndroidNotificationAlert />
      <Remote
        value={upcomingSessions}
        success={(upcoming) => {
          if (!upcoming.length) {
            return <NoUpcomingSessions />;
          }
          return <ListUpcomingWorkouts upcoming={upcoming} />;
        }}
      />
    </FullHeightScrollView>
  );
}
