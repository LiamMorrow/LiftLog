import { FloatingEmoji, FloatingEmojiLayer } from '@/components/presentation/feed/floating-emoji';
import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import TouchableRipple from '@/components/presentation/foundation/gesture-wrappers/touchable-ripple';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { REACTION_EMOJIS, ReactionEmoji } from '@/models/feed-models';
import { useAppSelector } from '@/store';
import { cheerFeedItem, selectSentReactionsByEvent } from '@/store/feed';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { useDispatch } from 'react-redux';

interface ReactionBarProps {
  eventId: string;
  /** Replays the cheers you've already sent when the card first appears. */
  animateOnMount?: boolean;
}

export function ReactionBar({ eventId, animateOnMount }: ReactionBarProps) {
  const dispatch = useDispatch();
  const { colors } = useAppTheme();
  const sentByEvent = useAppSelector(selectSentReactionsByEvent);
  const sent = useMemo(() => sentByEvent.get(eventId) ?? [], [sentByEvent, eventId]);

  const [floating, setFloating] = useState<FloatingEmoji[]>([]);
  const nextKey = useRef(0);

  const countFor = (emoji: ReactionEmoji) =>
    sent.filter((x) => x.emoji === emoji).reduce((total, x) => total + x.count, 0);

  const emit = useCallback((emoji: string, quantity: number) => {
    const created = Array.from({ length: Math.min(quantity, 8) }, (_, i) => ({
      key: `${nextKey.current++}`,
      emoji,
      drift: Math.round(Math.random() * 24) - 6,
      delayMs: i * 90,
    }));
    setFloating((current) => [...current, ...created]);
  }, []);

  const hasReplayed = useRef(false);
  useEffect(() => {
    if (!animateOnMount || hasReplayed.current || sent.length === 0) {
      return;
    }
    hasReplayed.current = true;
    for (const reaction of sent) {
      emit(reaction.emoji, reaction.count);
    }
  }, [animateOnMount, sent, emit]);

  const handleFinished = useCallback((key: string) => {
    setFloating((current) => current.filter((x) => x.key !== key));
  }, []);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing[1] }}>
      {REACTION_EMOJIS.map((emoji) => {
        const count = countFor(emoji);
        return (
          <TouchableRipple
            key={emoji}
            onPress={() => {
              dispatch(cheerFeedItem({ eventId, emoji, fromUserAction: true }));
              emit(emoji, 1);
            }}
            style={{
              borderRadius: 1000,
              overflow: 'hidden',
              paddingVertical: spacing[1],
              paddingHorizontal: spacing[3],
              borderWidth: 1,
              borderColor: count > 0 ? colors.secondary : colors.outlineVariant,
              backgroundColor: count > 0 ? colors.secondaryContainer : 'transparent',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[1] }}>
              <Text style={{ fontSize: 16 }}>{emoji}</Text>
              {count > 0 && (
                <SurfaceText font="text-sm" color="onSecondaryContainer" style={{ fontVariant: ['tabular-nums'] }}>
                  {count.toString()}
                </SurfaceText>
              )}
            </View>
          </TouchableRipple>
        );
      })}
      <FloatingEmojiLayer emojis={floating} onFinished={handleFinished} />
    </View>
  );
}
