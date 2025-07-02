import ConfirmationDialog from '@/components/presentation/confirmation-dialog';
import FullScreenDialog from '@/components/presentation/full-screen-dialog';
import LabelledForm from '@/components/presentation/labelled-form';
import LabelledFormRow from '@/components/presentation/labelled-form-row';
import ListSwitch from '@/components/presentation/list-switch';
import { Remote } from '@/components/presentation/remote';
import SessionSummary from '@/components/presentation/session-summary';
import SessionSummaryTitle from '@/components/presentation/session-summary-title';
import SplitCardControl from '@/components/presentation/split-card-control';
import { SurfaceText } from '@/components/presentation/surface-text';
import { spacing } from '@/hooks/useAppTheme';
import { useScroll } from '@/hooks/useScollListener';
import { FeedIdentity, FeedItem, SessionFeedItem } from '@/models/feed-models';
import { useAppSelector } from '@/store';
import { shareString } from '@/store/app';
import {
  fetchFeedItems,
  fetchInboxItems,
  selectFeedIdentityRemote,
  selectFeedSessionItems,
} from '@/store/feed';
import { T, useTranslate } from '@tolgee/react';
import { useState } from 'react';
import { FlatList, View } from 'react-native';
import {
  Button,
  Card,
  Icon,
  IconButton,
  List,
  TextInput,
} from 'react-native-paper';
import { useDispatch } from 'react-redux';

export default function Feed() {
  const feedItems = useAppSelector(selectFeedSessionItems);
  const { handleScroll } = useScroll();
  const fetchingFeedItems = useAppSelector((x) => x.feed.isFetching);
  const dispatch = useDispatch();
  return (
    <FlatList
      ListHeaderComponent={<FeedProfileHeader />}
      onRefresh={() => {
        dispatch(fetchInboxItems({ fromUserAction: true }));
        dispatch(fetchFeedItems({ fromUserAction: true }));
      }}
      refreshing={fetchingFeedItems}
      onScroll={handleScroll}
      data={feedItems}
      keyExtractor={(x) => x.eventId}
      renderItem={({ item }) => <FeedItemRenderer feedItem={item} />}
      contentContainerStyle={{
        gap: spacing[2],
        padding: spacing.pageHorizontalMargin,
      }}
    />
  );
}

function FeedProfileHeader() {
  const identityRemote = useAppSelector(selectFeedIdentityRemote);

  return (
    <Remote
      value={identityRemote}
      success={(identity) => <FeedProfile identity={identity} />}
    />
  );
}

function FeedProfile({ identity }: { identity: FeedIdentity }) {
  const dispatch = useDispatch();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [focusPublish, setFocusPublish] = useState(false);
  return (
    <>
      <Card mode="contained">
        <Card.Title
          left={({ size }) => <Icon source={'personFill'} size={size} />}
          title="Profile"
          titleVariant="headlineSmall"
        />
        <Card.Content>
          <SurfaceText>
            This is your feed, share it with your friends to let them follow
            your workouts!
          </SurfaceText>

          {identity.publishPlan ? undefined : (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <SurfaceText color="error">
                You are not publishing your workouts!
              </SurfaceText>
              <Button
                onPress={() => {
                  setFocusPublish(true);
                  setEditDialogOpen(true);
                }}
                mode="outlined"
              >
                <T keyName="Fix" />
              </Button>
            </View>
          )}
        </Card.Content>

        <Card.Actions>
          <IconButton
            icon={'edit'}
            onPress={() => {
              setFocusPublish(false);
              setEditDialogOpen(true);
            }}
          />
          <Button
            icon={'share'}
            onPress={() => {
              dispatch(
                shareString({
                  title: 'Share feed profile',
                  value: `https://app.liftlog.online/feed/share?id=${identity.id}${
                    identity.name
                      ? `&name=${encodeURIComponent(identity.name)}`
                      : ''
                  }`,
                }),
              );
            }}
          >
            <T keyName={'Share'} />
          </Button>
        </Card.Actions>
      </Card>
      <FeedProfileEditor
        open={editDialogOpen}
        focusPublish={focusPublish}
        onClose={() => setEditDialogOpen(false)}
        identity={identity}
      />
    </>
  );
}

function FeedProfileEditor({
  open,
  onClose,
  identity,
  focusPublish,
}: {
  open: boolean;
  onClose: () => void;
  identity: FeedIdentity;
  focusPublish: boolean;
}) {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const updateProfile = (value: Partial<FeedIdentity>) => {
    // TODO
  };
  const resetAccount = () => {
    //TODO
  };
  const [resetAccountDialogOpen, setResetAccountDialogOpen] = useState(false);
  return (
    <FullScreenDialog open={open} onClose={onClose} title={t('Manage Feed')}>
      <View
        style={{
          gap: spacing[2],
          marginHorizontal: -spacing.pageHorizontalMargin,
        }}
      >
        <LabelledForm>
          <LabelledFormRow icon={'person'} label={t('YourName')}>
            <TextInput
              placeholder={t('Optional')}
              value={identity.name ?? ''}
              label={t('Optional')}
              mode="outlined"
            />
          </LabelledFormRow>
        </LabelledForm>
        <List.Section>
          <ListSwitch
            focus={focusPublish}
            headline={t('PublishWorkout')}
            supportingText={t('PublishWorkoutSubtitle')}
            value={identity.publishWorkouts}
            onValueChange={(publishWorkouts) =>
              updateProfile({ publishWorkouts })
            }
          />
          <ListSwitch
            headline={t('PublishBodyweight')}
            supportingText={t('PublishBodyweightSubtitle')}
            value={identity.publishBodyweight}
            onValueChange={(publishBodyweight) =>
              updateProfile({ publishBodyweight })
            }
          />
          <ListSwitch
            headline={t('PublishPlan')}
            supportingText={t('PublishPlanSubtitle')}
            value={identity.publishPlan}
            onValueChange={(publishPlan) => updateProfile({ publishPlan })}
          />
        </List.Section>
        <Button onPress={() => setResetAccountDialogOpen(true)}>
          {t('ResetAccount')}
        </Button>
      </View>
      <ConfirmationDialog
        headline={t('ResetAccount')}
        textContent={t('ResetAccountMessage')}
        open={resetAccountDialogOpen}
        onOk={resetAccount}
        okText={t('ResetAccount')}
        onCancel={() => setResetAccountDialogOpen(false)}
      />
    </FullScreenDialog>
  );
}

function FeedItemRenderer(props: { feedItem: FeedItem }) {
  switch (true) {
    case props.feedItem instanceof SessionFeedItem:
      return (
        <Card mode="contained">
          <Card.Content>
            <SplitCardControl
              titleContent={
                <SessionSummaryTitle
                  isFilled={props.feedItem.session.isStarted}
                  session={props.feedItem.session}
                />
              }
              mainContent={
                <SessionSummary
                  session={props.feedItem.session}
                  isFilled={false}
                  showWeight
                />
              }
            />
          </Card.Content>
        </Card>
      );
    default:
      return undefined;
  }
}
