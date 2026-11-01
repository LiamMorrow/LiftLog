import { Popover } from '@/components/presentation/foundation/popover';
import { AppText } from '@/components/presentation/foundation/app-text';
import TouchableRipple from '@/components/presentation/foundation/touchable-ripple';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { StreakStats } from '@/store/activity';
import { flameIcon } from '@/components/presentation/summary/flame-icon';
import { useStreakCopy } from '@/components/presentation/summary/streak-copy';
import { Image, Platform, View } from 'react-native';
import { NativeIcon } from '@/components/presentation/foundation/native-icon';
import CheckIcon from '@expo/material-symbols/check.xml';

const PILL_HEIGHT = 36;

interface StreakPillProps {
  stats: StreakStats;
}

export function StreakPill({ stats }: StreakPillProps) {
  const { colors } = useAppTheme();
  const { weeks, hasStreak, isSafe, safeLabel, title, body, accessibilityLabel } = useStreakCopy(stats);

  if (!stats.hasHistory) {
    return null;
  }

  const isGlass = Platform.OS === 'ios';
  const ink = !hasStreak ? 'onSurfaceVariant' : isGlass ? 'onSurface' : 'onPrimaryContainer';
  const background = isGlass ? undefined : hasStreak ? colors.primaryContainer : colors.surfaceContainerHighest;

  return (
    <Popover
      accessibilityLabel={title}
      trigger={(open) => (
        <View
          style={{
            borderRadius: PILL_HEIGHT / 2,
            overflow: 'hidden',
            backgroundColor: background,
          }}
        >
          <TouchableRipple
            onPress={open}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
            testID="streak-pill"
          >
            <View style={{ justifyContent: 'center', height: PILL_HEIGHT, paddingHorizontal: spacing[2] }}>
              <Image source={flameIcon(isSafe, hasStreak ? weeks : undefined)} style={{ tintColor: colors[ink] }} />
            </View>
          </TouchableRipple>
        </View>
      )}
    >
      {() => (
        <View style={{ gap: spacing[1] }}>
          <AppText variant="titleLarge">{title}</AppText>
          {isSafe ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[1] }}>
              <NativeIcon icon={CheckIcon} systemImage="checkmark" size={16} />
              <AppText variant="labelLarge">{safeLabel}</AppText>
            </View>
          ) : (
            <AppText variant="bodyMedium" color="onSurfaceVariant">
              {body}
            </AppText>
          )}
        </View>
      )}
    </Popover>
  );
}
