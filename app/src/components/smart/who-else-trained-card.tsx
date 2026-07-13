import { getFeedItemHref } from '@/components/smart/feed-item';
import Button from '@/components/presentation/foundation/gesture-wrappers/button';
import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { spacing } from '@/hooks/useAppTheme';
import { useAppSelectorWithArg } from '@/store';
import { selectFriendActivityOnDate } from '@/store/activity';
import { LocalDate } from '@js-joda/core';
import { useTranslate } from '@tolgee/react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { Card } from 'react-native-paper';

interface WhoElseTrainedCardProps {
  date: LocalDate;
}

export function WhoElseTrainedCard({ date }: WhoElseTrainedCardProps) {
  const { t } = useTranslate();
  const { push } = useRouter();
  const activity = useAppSelectorWithArg(selectFriendActivityOnDate, date);

  if (activity.length === 0) {
    return null;
  }

  return (
    <Card mode="contained">
      <Card.Content style={{ gap: spacing[2] }}>
        <SurfaceText font="text-lg" weight="bold">
          {t('history.calendar.who_else_trained.title')}
        </SurfaceText>
        {activity.map(({ event, name }) => (
          <View
            key={event.id}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing[2] }}
          >
            <SurfaceText numberOfLines={1} style={{ flex: 1 }}>
              {name ?? t('feed.anonymous_user.label')}
            </SurfaceText>
            <Button mode="text" onPress={() => push(getFeedItemHref(event.eventId))}>
              {t('feed.view_workout.button')}
            </Button>
          </View>
        ))}
      </Card.Content>
    </Card>
  );
}
