import { Remote } from '@/components/presentation/remote';
import SharedItem from '@/components/smart/shared-item';
import { RemoteData } from '@/models/remote';
import { useAppSelector } from '@/store';
import { fetchSharedItem, selectSharedItem, setSharedItem } from '@/store/feed';
import { fromUrlSafeHexString } from '@/utils/to-url-safe-hex-string';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useDispatch } from 'react-redux';

export default function SharedItemPage() {
  let { id, k } = useLocalSearchParams<{
    id: string;
    k?: string;
  }>();
  id = 'wlw0wil0ka0g';
  k = '7a38fc5e6cd25ffbd5535cc10b574b99';
  const sharedRemote = useAppSelector(selectSharedItem);
  const dispatch = useDispatch();
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
    <Remote
      success={(x) => <SharedItem sharedItem={x} />}
      value={sharedRemote}
      retry={fetch}
    />
  );
}
