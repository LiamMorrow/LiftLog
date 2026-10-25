import { ReceivedReaction } from '@/models/feed-models';
import { useAppSelector } from '@/store';
import { selectReceivedReactionsByEvent } from '@/store/feed';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';

const NO_CHEERS: ReceivedReaction[] = [];

/**
 * Cheers that land while the workout is open, kept until dismissed. A cheer is a running total, so each arrival
 * carries only the taps added since it was last seen. Ones received before the workout opened are not replayed,
 * and a dismissed cheer stays dismissed when the inbox redelivers it.
 */
export function useArrivingCheers(sessionId: string | undefined) {
  const received = useAppSelector(selectReceivedReactionsByEvent).get(sessionId ?? '') ?? NO_CHEERS;
  const seenCounts = useRef<Map<string, number> | undefined>(undefined);
  const [cheers, setCheers] = useState<ReceivedReaction[]>([]);

  useEffect(() => {
    if (!seenCounts.current) {
      seenCounts.current = new Map(received.map((x) => [x.id, x.count]));
      return;
    }
    const seen = seenCounts.current;
    const arrived = received
      .filter((x) => x.count > (seen.get(x.id) ?? 0))
      .map(
        (x) =>
          new ReceivedReaction(x.id, x.eventId, x.fromUserId, x.emoji, x.count - (seen.get(x.id) ?? 0), x.reactedAt),
      );
    if (!arrived.length) {
      return;
    }
    received.forEach((x) => seen.set(x.id, Math.max(x.count, seen.get(x.id) ?? 0)));
    impactAsync(ImpactFeedbackStyle.Light).catch(console.log);
    setCheers((current) => [...current, ...arrived]);
  }, [received]);

  return { cheers, dismiss: () => setCheers([]) };
}
