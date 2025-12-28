import CardActions from '@/components/presentation/card-actionts';
import ConfirmationDialog from '@/components/presentation/confirmation-dialog';
import EmptyInfo from '@/components/presentation/empty-info';
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
import { useScroll } from '@/hooks/useScrollListener';
import { FeedIdentity, FeedItem, SessionFeedItem } from '@/models/feed-models';
import { useAppSelector } from '@/store';
import { shareString } from '@/store/app';
import {
  fetchFeedItems,
  fetchInboxItems,
  resetFeedAccount,
  selectFeedFollowing,
  selectFeedIdentityRemote,
  selectFeedSessionItems,
  updateFeedIdentity,
} from '@/store/feed';
import { T, useTranslate } from '@tolgee/react';
import { useState } from 'react';
import { View } from 'react-native';
import { Card, Icon, List, TextInput } from 'react-native-paper';
import Button from '@/components/presentation/gesture-wrappers/button';
import { useDispatch } from 'react-redux';
import IconButton from '@/components/presentation/gesture-wrappers/icon-button';
import { FlashList } from '@shopify/flash-list';

export default function Feed() {
  const feedItems = useAppSelector(selectFeedSessionItems);
  const { handleScroll } = useScroll();
  const fetchingFeedItems = useAppSelector((x) => x.feed.isFetching);
  const dispatch = useDispatch();
  return (
    <FlashList
      testID="feed-list"
      ListHeaderComponent={<FeedProfileHeader />}
      onRefresh={() => {
        dispatch(fetchInboxItems({ fromUserAction: true }));
        dispatch(fetchFeedItems({ fromUserAction: true }));
      }}
      ListEmptyComponent={
        <EmptyInfo style={{ marginTop: spacing[8] }}>
          <T keyName="feed.no_following_data.message" />
        </EmptyInfo>
      }
      refreshing={fetchingFeedItems}
      onScroll={handleScroll}
      data={feedItems}
      keyExtractor={(x) => x.eventId}
      renderItem={({ item }) => <FeedItemRenderer feedItem={item} />}
      ItemSeparatorComponent={() => (
        <View style={{ height: spacing[2] }}></View>
      )}
      contentContainerStyle={{
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
  const shareUrl = `https://app.liftlog.online/feed/share?id=${identity.lookup}${
    identity.name ? `&name=${encodeURIComponent(identity.name)}` : ''
  }`;
  const { t } = useTranslate();
  return (
    <>
      <Card mode="contained" style={{ marginBottom: spacing[2] }}>
        <Card.Title
          left={({ size }) => <Icon source={'personFill'} size={size} />}
          title={t('feed.profile.title')}
          titleVariant="headlineSmall"
        />
        <Card.Content>
          <View
            style={{ display: 'none' }}
            testID="share-url"
            // @ts-expect-error -- This only works on web, ignored elsewhere
            dataSet={{ shareUrl }}
          />
          <SurfaceText>
            <T keyName="feed.explanation.body" />
          </SurfaceText>

          {identity.publishWorkouts ? undefined : (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
              }}
            >
              <SurfaceText color="error">
                <T keyName="feed.not_publishing_workouts.error" />
              </SurfaceText>
              <Button
                style={{ marginLeft: 'auto' }}
                testID="feed-fix-button"
                onPress={() => {
                  setFocusPublish(true);
                  setEditDialogOpen(true);
                }}
                mode="outlined"
              >
                <T keyName="generic.fix.button" />
              </Button>
            </View>
          )}
        </Card.Content>

        <CardActions>
          <IconButton
            mode="contained"
            icon={'edit'}
            onPress={() => {
              setFocusPublish(false);
              setEditDialogOpen(true);
            }}
          />
          <Button
            testID="feed-share-button"
            mode="contained"
            icon={'share'}
            onPress={() => {
              dispatch(
                shareString({
                  title: 'Share feed profile',
                  value: shareUrl,
                }),
              );
            }}
          >
            <T keyName="generic.share.button" />
          </Button>
        </CardActions>
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
    dispatch(updateFeedIdentity({ updates: value, fromUserAction: true }));
  };
  const resetAccount = () => {
    dispatch(resetFeedAccount({ fromUserAction: true }));
  };
  const [resetAccountDialogOpen, setResetAccountDialogOpen] = useState(false);
  return (
    <FullScreenDialog
      open={open}
      onClose={onClose}
      title={t('feed.manage.title')}
    >
      <View
        style={{
          gap: spacing[2],
          marginHorizontal: -spacing.pageHorizontalMargin,
        }}
      >
        <LabelledForm>
          <LabelledFormRow
            icon={'personFill'}
            label={t('feed.your_name.label')}
          >
            <TextInput
              placeholder={t('generic.optional.label')}
              value={identity.name ?? ''}
              label={t('generic.optional.label')}
              mode="outlined"
              onChangeText={(name) => updateProfile({ name })}
            />
          </LabelledFormRow>
        </LabelledForm>
        <List.Section>
          <ListSwitch
            testID="feed-publish-workouts-switch"
            focus={focusPublish}
            headline={t('feed.publish_workout.label')}
            supportingText={t('feed.publish_workout.subtitle')}
            value={identity.publishWorkouts}
            onValueChange={(publishWorkouts) =>
              updateProfile({ publishWorkouts })
            }
          />
          <ListSwitch
            headline={t('feed.publish_bodyweight.label')}
            supportingText={t('feed.publish_bodyweight.subtitle')}
            value={identity.publishBodyweight}
            onValueChange={(publishBodyweight) =>
              updateProfile({ publishBodyweight })
            }
          />
          <ListSwitch
            headline={t('feed.publish_plan.label')}
            supportingText={t('feed.publish_plan.subtitle')}
            value={identity.publishPlan}
            onValueChange={(publishPlan) => updateProfile({ publishPlan })}
          />
        </List.Section>
        <Button onPress={() => setResetAccountDialogOpen(true)}>
          {t('feed.reset_account.button')}
        </Button>
      </View>
      <ConfirmationDialog
        headline={t('feed.reset_account.button')}
        textContent={t('feed.reset_account.confirm.body')}
        open={resetAccountDialogOpen}
        onOk={resetAccount}
        okText={t('feed.reset_account.button')}
        onCancel={() => setResetAccountDialogOpen(false)}
      />
    </FullScreenDialog>
  );
}

function FeedItemRenderer(props: { feedItem: FeedItem }) {
  const users = useAppSelector(selectFeedFollowing);
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
                <View style={{ gap: spacing[2] }}>
                  <SessionSummary
                    session={props.feedItem.session}
                    isFilled={false}
                    showWeight
                  />
                  <SurfaceText>
                    <SurfaceText weight={'bold'}>
                      {users.find((x) => x.userId === props.feedItem.userId)
                        ?.user.displayName ?? 'Anonymous user'}
                    </SurfaceText>{' '}
                    completed a workout
                  </SurfaceText>
                </View>
              }
            />
          </Card.Content>
        </Card>
      );
    default:
      return undefined;
  }
}
