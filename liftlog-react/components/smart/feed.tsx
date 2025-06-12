import { Remote } from '@/components/presentation/remote';
import SessionSummary from '@/components/presentation/session-summary';
import SessionSummaryTitle from '@/components/presentation/session-summary-title';
import SplitCardControl from '@/components/presentation/split-card-control';
import { SurfaceText } from '@/components/presentation/surface-text';
import { spacing } from '@/hooks/useAppTheme';
import { useScroll } from '@/hooks/useScollListener';
import { FeedIdentity, FeedItem, SessionFeedItem } from '@/models/feed-models';
import { useAppSelector } from '@/store';
import { selectFeedIdentityRemote, selectFeedSessionItems } from '@/store/feed';
import { T } from '@tolgee/react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { Button, Card, Icon, IconButton } from 'react-native-paper';

export default function Feed() {
  const feedItems = useAppSelector(selectFeedSessionItems);
  const { setScrolled } = useScroll();
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setScrolled(offsetY > 0);
  };
  return (
    <FlatList
      ListHeaderComponent={<FeedShareUrlHeader />}
      onScroll={handleScroll}
      data={feedItems}
      keyExtractor={(x) => x.eventId}
      renderItem={({ item }) => <FeedItemRenderer feedItem={item} />}
      contentContainerStyle={{ gap: spacing[2], padding: spacing[2] }}
    />
  );
}

function FeedShareUrlHeader() {
  const identityRemote = useAppSelector(selectFeedIdentityRemote);

  return (
    <Remote
      value={identityRemote}
      success={(identity) => <FeedShareUrl identity={identity} />}
    />
  );
}

function FeedShareUrl({ identity }: { identity: FeedIdentity }) {
  return (
    <Card>
      <Card.Title
        left={({ size }) => <Icon source={'personFill'} size={size} />}
        title="Profile"
        titleVariant="headlineMedium"
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
      </Card.Content>

      <Card.Actions>
        <IconButton icon={'edit'} onPress={() => {}} />
        <Button icon={'share'} onPress={() => {}}>
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
