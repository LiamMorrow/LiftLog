import { Remote } from '@/components/presentation/remote';
import SharedItem from '@/components/smart/shared-item';
import { RemoteData } from '@/models/remote';
import { useAppSelector } from '@/store';
import { fetchSharedItem, selectSharedItem, setSharedItem } from '@/store/feed';
import { fromUrlSafeHexString } from '@/utils/to-url-safe-hex-string';
import { useTranslate } from '@tolgee/react';
import { Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useDispatch } from 'react-redux';

export default function SharedItemPage() {
  const { id, k } = useLocalSearchParams<{
    id: string;
    k?: string;
  }>();
  const sharedRemote = useAppSelector(selectSharedItem);
  const dispatch = useDispatch();
  const { t } = useTranslate();
  const fetch = () => {
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
  };
  useFocusEffect(() => {
    fetch();
  });
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
