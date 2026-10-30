import { ActivityCalendar } from '@/components/presentation/calendar/activity-calendar';
import { PersonAvatar } from '@/components/presentation/feed/person-avatar';
import { Popover } from '@/components/presentation/foundation/popover';
import TouchableRipple from '@/components/presentation/foundation/touchable-ripple';
import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { spacing } from '@/hooks/useAppTheme';
import { useToday } from '@/hooks/useToday';
import { useAppSelector, useAppSelectorWithArg } from '@/store';
import { ActivityRow, OWN_USER_KEY, selectActivityWeek, selectFollowsOtherUsers } from '@/store/activity';
import { selectOwnFeedUserId } from '@/store/feed';
import { useOwnHistory } from '@/components/smart/own-history-provider';
import { useTranslate } from '@tolgee/react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

/** Beyond this the strip stops being a glance and starts being a list. */
const MAX_ROWS = 8;
const AVATAR_SIZE = 32;

export function FeedWeekStrip() {
  const { t } = useTranslate();
  const today = useToday();
  const own = useOwnHistory();
  const rows = useAppSelectorWithArg(selectActivityWeek, { today, own });
  const followsAnyone = useAppSelector(selectFollowsOtherUsers);
  const ownUserId = useAppSelector(selectOwnFeedUserId);
  const ownName = useAppSelector((x) => x.feed.identity.unwrapOr(undefined)?.name);

  if (!followsAnyone) {
    return null;
  }

  const [ownRow, ...friendRows] = rows;
  const visibleFriendRows = friendRows.slice(0, MAX_ROWS - 1);
  const overflow = friendRows.length - visibleFriendRows.length;

  return (
    <View style={{ gap: spacing[2], marginBottom: spacing[6] }}>
      <Text variant="titleMedium" numberOfLines={1}>
        {t('feed.this_week.title')}
      </Text>

      <ActivityCalendar
        density="week"
        rows={[ownRow!, ...visibleFriendRows]}
        renderRowLeading={(row) =>
          row.key === OWN_USER_KEY ? (
            <NamedAvatar
              userId={ownUserId ?? OWN_USER_KEY}
              name={ownName}
              fallbackName={t('feed.you.label')}
              row={row}
            />
          ) : (
            <NamedAvatar userId={row.key} name={row.label} fallbackName={t('feed.anonymous_user.label')} row={row} />
          )
        }
      />

      {overflow > 0 && (
        <SurfaceText font="text-sm" color="onSurfaceVariant">
          {t('feed.this_week.more_people', { count: overflow.toString() })}
        </SurfaceText>
      )}
    </View>
  );
}

interface NamedAvatarProps {
  userId: string;
  name: string | undefined;
  fallbackName: string;
  row: ActivityRow;
}

function NamedAvatar({ userId, name, fallbackName, row }: NamedAvatarProps) {
  const { t } = useTranslate();
  const displayName = name || fallbackName;
  const workouts = row.cells.filter((cell) => cell.level > 0).length;

  return (
    <Popover
      accessibilityLabel={displayName}
      width={240}
      trigger={(open) => (
        <View style={{ borderRadius: AVATAR_SIZE / 2, overflow: 'hidden' }}>
          <TouchableRipple onPress={open} accessibilityRole="button" accessibilityLabel={displayName}>
            <PersonAvatar userId={userId} name={name} size={AVATAR_SIZE} />
          </TouchableRipple>
        </View>
      )}
    >
      {() => (
        <View style={{ gap: spacing[1] }}>
          <SurfaceText font="text-lg" weight="bold">
            {displayName}
          </SurfaceText>
          <SurfaceText font="text-sm" color="onSurfaceVariant">
            {workouts === 1
              ? t('feed.workouts_this_week.one')
              : t('feed.workouts_this_week.other', { count: workouts.toString() })}
          </SurfaceText>
        </View>
      )}
    </Popover>
  );
}
