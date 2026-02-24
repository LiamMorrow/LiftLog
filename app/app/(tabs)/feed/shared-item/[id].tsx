import { Remote } from '@/components/presentation/foundation/remote';
import SharedItem from '@/components/smart/shared-item';
import { RemoteData } from '@/models/remote';
import { useAppSelector } from '@/store';
import { fetchSharedItem, selectSharedItem, setSharedItem } from '@/store/feed';
import { fromUrlSafeHexString } from '@/utils/to-url-safe-hex-string';
import { useTranslate } from '@tolgee/react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';

export default function SharedItemPage() {
  const { id, k } = useLocalSearchParams<{
    id: string;
    k?: string;
  }>();
  const sharedRemote = useAppSelector(selectSharedItem);
  const dispatch = useDispatch();
  const { t } = useTranslate();
  const fetch = useCallback(() => {
    const parsedKey = fromUrlSafeHexString(k);
    if (parsedKey) {
      dispatch(fetchSharedItem({ id, key: { value: parsedKey } }));
    } else {
      dispatch(
        setSharedItem(
          RemoteData.error('Could not load shared item. Bad key provided.'),
        ),
      );
    }
  }, [k, dispatch, id]);
  useEffect(() => {
    fetch();
  }, [fetch]);
  return (
    <>
      <Stack.Screen
        options={{
          title: t('feed.shared_item.title'),
        }}
      />
      <Remote
        success={(x) => <SharedItem sharedItem={x} />}
        value={sharedRemote}
        retry={fetch}
      />
    </>
  );
}
