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
import { T } from '@tolgee/react';
import { FlatList } from 'react-native';
import { Button, Card, Icon, IconButton } from 'react-native-paper';
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
      contentContainerStyle={{ gap: spacing[2], padding: spacing[2] }}
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
  return (
    <Card mode="contained">
      <Card.Title
        left={({ size }) => <Icon source={'personFill'} size={size} />}
        title="Profile"
        titleVariant="headlineSmall"
      />
      <Card.Content>
        <SurfaceText>
          This is your feed, share it with your friends to let them follow your
          workouts!
        </SurfaceText>

        {identity.publishPlan ? undefined : (
          <SurfaceText color="error">
            You are not publishing your workouts!
          </SurfaceText>
        )}
        {/* TODO I think we wanna show the profile info like name and configuration... */}
      </Card.Content>

      <Card.Actions>
        <IconButton
          icon={'edit'}
          onPress={() => {
            // TODO
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
  );
}

function FeedItemRenderer(props: { feedItem: FeedItem }) {
  switch (true) {
    case props.feedItem instanceof SessionFeedItem:
      return (
        <Card mode="outlined">
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
