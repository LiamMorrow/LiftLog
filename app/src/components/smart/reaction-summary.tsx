import { FloatingEmoji, FloatingEmojiLayer } from '@/components/presentation/feed/floating-emoji';
import { AppText } from '@/components/presentation/foundation/app-text';
import { spacing } from '@/hooks/useAppTheme';
import { ReceivedReaction } from '@/models/feed-models';
import { useAppSelector } from '@/store';
import { selectReceivedReactionsByEvent } from '@/store/feed';
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

export function ReactionSummary({ eventId, animateOnMount, compact }: ReactionSummaryProps) {
  const { t } = useTranslate();
  const receivedByEvent = useAppSelector(selectReceivedReactionsByEvent);
  const friends = useAppSelector((x) => x.feed.friends);
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
        drift: Math.round(Math.random() * 24) - 12,
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

  const totals = new Map<string, number>([]);
  for (const reaction of received) {
    totals.set(reaction.emoji, (totals.get(reaction.emoji) ?? 0) + reaction.count);
  }

  const nameOf = (reaction: ReceivedReaction) => friends[reaction.fromUserId]?.name ?? t('feed.anonymous_user.label');

  const names = [...new Set(received.map(nameOf))];

  return (
    <View style={{ gap: spacing[1], marginTop: spacing[2] }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2], flexWrap: 'wrap' }}>
        {[...totals].map(([emoji, count]) => (
          <View key={emoji} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[1] }}>
            <Text style={{ fontSize: 16 }}>{emoji}</Text>
            <AppText variant="bodyMedium">{count.toString()}</AppText>
            <FloatingEmojiLayer emojis={floating.filter((x) => x.emoji === emoji)} onFinished={handleFinished} />
          </View>
        ))}
      </View>

      <AppText variant="bodyMedium" color="onSurfaceVariant">
        {t('feed.cheers.from.message', { names: names.join(', ') })}
      </AppText>

      {compact ? undefined : (
        <AppText variant="bodySmall" color="onSurfaceVariant">
          {t('feed.cheers.private.explanation')}
        </AppText>
      )}
    </View>
  );
}
