import { LiveChip } from '@/components/feed/live-chip';
import { Card } from '@/components/foundation/card';
import { PersonAvatar } from '@/components/feed/person-avatar';
import { NativeIcon } from '@/components/foundation/native-icon';
import ChevronRightIcon from '@expo/material-symbols/chevron_right.xml';
import { AppText } from '@/components/foundation/app-text';
import TouchableRipple from '@/components/foundation/touchable-ripple';
import { TitledSection } from '@/components/foundation/titled-section';
import { getFeedItemHref } from '@/components/feed/feed-item';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { LIVE_CLOCK_INTERVAL_MS, useLiveLabel } from '@/hooks/useLiveLabel';
import { useNow } from '@/hooks/useNow';
import { LiveSessionUserEvent } from '@/models/feed-models';
import { useAppSelector } from '@/store';
import { selectLiveSessions } from '@/store/feed';
import { useTranslate } from '@tolgee/react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

export function TrainingNow() {
  const { t } = useTranslate();
  const now = useNow(LIVE_CLOCK_INTERVAL_MS);
  const liveSessions = useAppSelector(selectLiveSessions).filter((x) => !x.isStale(now));

  if (!liveSessions.length) {
    return null;
  }

  return (
    <TitledSection title={t('feed.training_now.title')} style={{ marginBottom: spacing[6] }}>
      <Card>
        {liveSessions.map((item, index) => (
          <TrainingNowRow key={item.id} item={item} divided={index > 0} />
        ))}
      </Card>
    </TitledSection>
  );
}

function TrainingNowRow({ item, divided }: { item: LiveSessionUserEvent; divided: boolean }) {
  const { t } = useTranslate();
  const { colors } = useAppTheme();
  const { push } = useRouter();
  const name = useAppSelector((x) => x.feed.friends[item.userId]?.name);
  const { session } = item;
  const setCount = session.completedSetCount;
  const liveLabel = useLiveLabel(item);

  const detail = session.isStarted
    ? t(setCount === 1 ? 'feed.training_now.sets.one' : 'feed.training_now.sets.other', {
        workout: session.blueprint.name,
        count: setCount.toString(),
      })
    : t('feed.training_now.just_started', { workout: session.blueprint.name });

  return (
    <TouchableRipple
      testID="feed-training-now-row"
      onPress={() => push(getFeedItemHref(item.eventId))}
      style={{
        borderTopWidth: divided ? 1 : 0,
        borderTopColor: colors.outlineVariant,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing[3],
          minHeight: 64,
          paddingVertical: spacing[2],
          paddingLeft: spacing[4],
          paddingRight: spacing[3],
        }}
      >
        <PersonAvatar userId={item.userId} name={name} size={40} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <AppText variant="titleMedium" numberOfLines={1}>
            {name ?? t('feed.anonymous_user.label')}
          </AppText>
          <AppText variant="bodyMedium" color="onSurfaceVariant" numberOfLines={1}>
            {detail}
          </AppText>
        </View>
        <LiveChip label={liveLabel} />
        <NativeIcon icon={ChevronRightIcon} systemImage="chevron.right" size={20} color={colors.onSurfaceVariant} />
      </View>
    </TouchableRipple>
  );
}
