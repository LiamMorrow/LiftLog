import { getFeedItemHref } from '@/components/smart/feed-item';
import Button from '@/components/presentation/foundation/button';
import { AppText } from '@/components/presentation/foundation/app-text';
import { spacing } from '@/hooks/useAppTheme';
import { useAppSelectorWithArg } from '@/store';
import { selectFriendActivityOnDate } from '@/store/activity';
import { LocalDate } from '@js-joda/core';
import { useTranslate } from '@tolgee/react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

interface WhoElseTrainedProps {
  date: LocalDate;
}

export function WhoElseTrained({ date }: WhoElseTrainedProps) {
  const { t } = useTranslate();
  const { push } = useRouter();
  const activity = useAppSelectorWithArg(selectFriendActivityOnDate, date);

  if (activity.length === 0) {
    return null;
  }

  return (
    <View>
      {activity.map(({ event, name }) => (
        <View key={event.id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
          <AppText variant="bodyMedium" numberOfLines={1} style={{ flex: 1 }}>
            {t('history.calendar.friend_trained.label', { name: name ?? t('feed.anonymous_user.label') })}
          </AppText>
          <Button mode="text" onPress={() => push(getFeedItemHref(event.eventId))}>
            {t('feed.view_workout.button')}
          </Button>
        </View>
      ))}
    </View>
  );
}
