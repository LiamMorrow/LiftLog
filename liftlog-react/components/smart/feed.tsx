import SessionSummary from '@/components/presentation/session-summary';
import SessionSummaryTitle from '@/components/presentation/session-summary-title';
import SplitCardControl from '@/components/presentation/split-card-control';
import { SurfaceText } from '@/components/presentation/surface-text';
import { spacing } from '@/hooks/useAppTheme';
import { useScroll } from '@/hooks/useScollListener';
import { FeedItem, SessionFeedItem } from '@/models/feed-models';
import { useAppSelector } from '@/store';
import { selectFeedSessionItems } from '@/store/feed';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { Card } from 'react-native-paper';

export default function Feed() {
  const feedItems = useAppSelector(selectFeedSessionItems);
  const { setScrolled } = useScroll();
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setScrolled(offsetY > 0);
  };
  return (
    <FlatList
      ListHeaderComponent={<SurfaceText>hu</SurfaceText>}
      onScroll={handleScroll}
      data={feedItems}
      keyExtractor={(x) => x.eventId}
      renderItem={({ item }) => <FeedItemRenderer feedItem={item} />}
      contentContainerStyle={{ gap: spacing[2], padding: spacing[2] }}
    />
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
