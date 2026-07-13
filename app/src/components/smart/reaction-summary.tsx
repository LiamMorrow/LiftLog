import { FloatingEmoji, FloatingEmojiLayer } from '@/components/presentation/feed/floating-emoji';
import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { spacing } from '@/hooks/useAppTheme';
import { ReceivedReaction } from '@/models/feed-models';
import { useAppSelector } from '@/store';
import { selectFeedFollowers, selectReceivedReactionsByEvent } from '@/store/feed';
import { useTranslate } from '@tolgee/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Text, View } from 'react-native';

interface ReactionSummaryProps {
  /** The session id, which is also its feed event id. */
  eventId: string;
  animateOnMount?: boolean;
  /** Drops the privacy copy, which only needs saying once per screen rather than once per card. */
  compact?: boolean;
}

/**
 * Author-only. The feed is end-to-end encrypted with one-way follows, so there is no channel by which anyone
 * but the author could learn who cheered — the copy has to say so, or it reads as a broken like count.
 */
export function ReactionSummary({ eventId, animateOnMount, compact }: ReactionSummaryProps) {
  const { t } = useTranslate();
  const receivedByEvent = useAppSelector(selectReceivedReactionsByEvent);
  const followers = useAppSelector(selectFeedFollowers);
  const received = useMemo(() => receivedByEvent.get(eventId) ?? [], [receivedByEvent, eventId]);

  const [floating, setFloating] = useState<FloatingEmoji[]>([]);
  const nextKey = useRef(0);
  const hasReplayed = useRef(false);

  useEffect(() => {
    if (!animateOnMount || hasReplayed.current || received.length === 0) {
      return;
    }
    hasReplayed.current = true;
    setFloating(
      received.slice(0, 8).map((reaction, i) => ({
        key: `${nextKey.current++}`,
        emoji: reaction.emoji,
        drift: Math.round(Math.random() * 24) - 6,
        delayMs: i * 90,
      })),
    );
  }, [animateOnMount, received]);

  const handleFinished = useCallback((key: string) => {
    setFloating((current) => current.filter((x) => x.key !== key));
  }, []);

  if (received.length === 0) {
    return null;
  }

  const totals = new Map<string, number>();
  for (const reaction of received) {
    totals.set(reaction.emoji, (totals.get(reaction.emoji) ?? 0) + reaction.count);
  }

  const nameOf = (reaction: ReceivedReaction) =>
    followers.find((x) => x.id === reaction.fromUserId)?.name ?? t('feed.anonymous_user.label');

  const names = [...new Set(received.map(nameOf))];

  return (
    <View style={{ gap: spacing[1] }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2], flexWrap: 'wrap' }}>
        {[...totals].map(([emoji, count]) => (
          <View key={emoji} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[1] }}>
            <Text style={{ fontSize: 16 }}>{emoji}</Text>
            <SurfaceText font="text-sm">{count.toString()}</SurfaceText>
          </View>
        ))}
        <FloatingEmojiLayer emojis={floating} onFinished={handleFinished} />
      </View>

      <SurfaceText font="text-sm" color="onSurfaceVariant">
        {t('feed.cheers.from.message', { names: names.join(', ') })}
      </SurfaceText>

      {compact ? undefined : (
        <SurfaceText font="text-xs" color="onSurfaceVariant">
          {t('feed.cheers.private.explanation')}
        </SurfaceText>
      )}
    </View>
  );
}
