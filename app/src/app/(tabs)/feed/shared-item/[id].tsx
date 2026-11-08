import { Remote } from '@/components/foundation/remote';
import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import SharedItem, { SharedItemActions } from '@/components/feed/shared-item';
import { RemoteData } from '@/models/remote';
import { useAppSelector } from '@/store';
import { fetchSharedItem, selectSharedItem, setSharedItem } from '@/store/feed';
import { fromSharedItemKeyFragment } from '@/utils/shared-item-key';
import { useTranslate } from '@tolgee/react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';

export default function SharedItemPage() {
  const {
    id,
    '#': hashKey,
    k: legacyQueryKey,
  } = useLocalSearchParams<{
    id: string;
    '#'?: string;
    k?: string;
  }>();
  const k = hashKey || legacyQueryKey;
  const sharedRemote = useAppSelector(selectSharedItem);
  const dispatch = useDispatch();
  const { t } = useTranslate();
  const fetch = useCallback(() => {
    const key = fromSharedItemKeyFragment(k);
    if (key) {
      dispatch(fetchSharedItem({ id, key }));
    } else {
      dispatch(setSharedItem(RemoteData.error('Could not load shared item. Bad key provided.')));
    }
  }, [k, dispatch, id]);
  useEffect(() => {
    fetch();
  }, [fetch]);
  const sharedItem = sharedRemote.unwrapOr(undefined);
  return (
    <FullHeightScrollView floatingChildren={sharedItem && <SharedItemActions sharedItem={sharedItem} />}>
      <Stack.Screen
        options={{
          title: t('feed.shared_item.title'),
        }}
      />
      <Remote success={(x) => <SharedItem sharedItem={x} />} value={sharedRemote} retry={fetch} />
    </FullHeightScrollView>
  );
}
