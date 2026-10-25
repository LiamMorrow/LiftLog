import { LiveChip } from '@/components/presentation/feed/live-chip';
import { PersonAvatar } from '@/components/presentation/feed/person-avatar';
import Icon from '@/components/presentation/foundation/icon';
import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import TouchableRipple from '@/components/presentation/foundation/touchable-ripple';
import { getFeedItemHref } from '@/components/smart/feed-item';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { LIVE_CLOCK_INTERVAL_MS, useLiveLabel } from '@/hooks/useLiveLabel';
import { useNow } from '@/hooks/useNow';
import { LiveSessionUserEvent } from '@/models/feed-models';
import { useAppSelector } from '@/store';
import { selectLiveSessions } from '@/store/feed';
import { useTranslate } from '@tolgee/react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { Card } from 'react-native-paper';

export function TrainingNow() {
  const { t } = useTranslate();
  const now = useNow(LIVE_CLOCK_INTERVAL_MS);
  const liveSessions = useAppSelector(selectLiveSessions).filter((x) => !x.isStale(now));

  if (!liveSessions.length) {
    return null;
  }

  return (
    <View style={{ gap: spacing[2], marginBottom: spacing[2] }}>
      <SurfaceText font="text-sm" weight="500" color="onSurfaceVariant">
        {t('feed.training_now.title')}
      </SurfaceText>
      <Card mode="contained">
        {liveSessions.map((item, index) => (
          <TrainingNowRow key={item.id} item={item} divided={index > 0} />
        ))}
      </Card>
    </View>
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
          <SurfaceText weight="500" numberOfLines={1}>
            {name ?? t('feed.anonymous_user.label')}
          </SurfaceText>
          <SurfaceText font="text-sm" color="onSurfaceVariant" numberOfLines={1}>
            {detail}
          </SurfaceText>
        </View>
        <LiveChip label={liveLabel} />
        <Icon source="chevronRight" size={20} color={colors.onSurfaceVariant} />
      </View>
    </TouchableRipple>
  );
}
