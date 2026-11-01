import { FloatingEmoji, FloatingEmojiLayer } from '@/components/presentation/feed/floating-emoji';
import { PersonAvatar } from '@/components/presentation/feed/person-avatar';
import { REVEAL_DURATION_MS } from '@/components/presentation/foundation/reveal';
import { AppText } from '@/components/presentation/foundation/app-text';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import IconButton from '@/components/presentation/foundation/icon-button';
import { ReceivedReaction } from '@/models/feed-models';
import { useAppSelector } from '@/store';
import { useTranslate } from '@tolgee/react';
import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';

const MAX_AVATARS = 3;
const MAX_FLOATING_PER_CHEER = 4;
const MAX_FLOATING_PER_BURST = 10;

/** Survives the banner moving between the rest timer and its own pane, so a cheer floats up only once. */
const launched = new WeakSet<ReceivedReaction>();

export function CheerBanner({ cheers, onDismiss }: { cheers: ReceivedReaction[]; onDismiss: () => void }) {
  const { t } = useTranslate();
  const { colors } = useAppTheme();
  const friends = useAppSelector((x) => x.feed.friends);
  const senders = [...new Set(cheers.map((x) => x.fromUserId))];
  const names = senders.map((id) => friends[id]?.name ?? t('feed.anonymous_user.label'));
  const emojis = [...new Set(cheers.map((x) => x.emoji))];
  const [floating, setFloating] = useFloatingCheers(cheers);

  return (
    <View
      testID="cheer-banner"
      accessibilityLiveRegion="polite"
      style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}
    >
      <View style={{ flexDirection: 'row' }}>
        {senders.slice(0, MAX_AVATARS).map((id, index) => (
          <View
            key={id}
            style={{
              marginLeft: index ? -spacing[2] : 0,
              borderRadius: 14,
              borderWidth: 2,
              borderColor: colors.surfaceContainerHigh,
            }}
          >
            <PersonAvatar userId={id} name={friends[id]?.name} size={24} />
          </View>
        ))}
      </View>
      <AppText variant="titleMedium" numberOfLines={1} style={{ flex: 1 }}>
        {t('workout.cheers.received.message', { names: names.join(', ') })}
      </AppText>
      <View>
        <Text style={{ fontSize: 18 }}>{emojis.join('')}</Text>
        <FloatingEmojiLayer
          emojis={floating}
          onFinished={(key) => setFloating((current) => current.filter((x) => x.key !== key))}
        />
      </View>
      <IconButton
        testID="cheer-banner-dismiss"
        icon="close"
        size={18}
        style={{ margin: 0 }}
        iconColor={colors.onSurfaceVariant}
        accessibilityLabel={t('generic.close.button')}
        onPress={onDismiss}
      />
    </View>
  );
}

function useFloatingCheers(cheers: ReceivedReaction[]) {
  const hasLaunched = useRef(false);
  const nextKey = useRef(0);
  const [floating, setFloating] = useState<FloatingEmoji[]>([]);

  useEffect(() => {
    const fresh = cheers.filter((x) => !launched.has(x));
    if (!fresh.length) {
      return;
    }
    fresh.forEach((x) => launched.add(x));
    const opening = !hasLaunched.current;
    hasLaunched.current = true;
    const burst = fresh
      .flatMap((x) => Array.from({ length: Math.min(x.count, MAX_FLOATING_PER_CHEER) }, () => x.emoji))
      .slice(0, MAX_FLOATING_PER_BURST);
    setFloating((current) => [
      ...current,
      ...burst.map((emoji, i) => ({
        key: `${nextKey.current++}`,
        emoji,
        drift: Math.round(Math.random() * 32) - 16,
        delayMs: (opening ? REVEAL_DURATION_MS : 0) + i * 90,
      })),
    ]);
  }, [cheers]);

  return [floating, setFloating] as const;
}
