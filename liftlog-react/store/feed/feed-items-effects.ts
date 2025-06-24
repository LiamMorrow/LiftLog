import { fetchFeedItems, setIsFetching } from '@/store/feed';
import { addEffect } from '@/store/listenerMiddleware';
import { sleep } from '@/utils/sleep';

export function addFeedItemEffects() {
  addEffect(fetchFeedItems, async (_, { dispatch }) => {
    // TODO implement
    dispatch(setIsFetching(true));
    await sleep(3000);
    dispatch(setIsFetching(false));
  });
}
