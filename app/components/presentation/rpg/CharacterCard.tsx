import XpProgressBar from '@/components/presentation/rpg/XpProgressBar';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { useAppSelector } from '@/store';
import { selectAllAchievements, selectRpgLevel, selectRpgTitle, selectXpProgress } from '@/store/rpg';
import { View } from 'react-native';
import { Icon, Text } from 'react-native-paper';

export default function CharacterCard() {
  const { colors } = useAppTheme();
  const level = useAppSelector(selectRpgLevel);
  const title = useAppSelector(selectRpgTitle);
  const progress = useAppSelector(selectXpProgress);
  const totalWorkouts = useAppSelector((s) => s.rpg.totalWorkouts);
  const streakDays = useAppSelector((s) => s.rpg.streakDays);
  const unlockedCount = useAppSelector(
    (s) => selectAllAchievements(s).filter((a) => a.unlockedAt).length,
  );

  return (
    <View
      style={{
        backgroundColor: colors.surfaceContainer,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.primary,
        padding: spacing[4],
        gap: spacing[3],
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[3] }}>
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 4,
            backgroundColor: colors.primaryContainer,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.primary,
          }}
        >
          <Icon source="shield" size={32} color={colors.primary} />
        </View>
        <View style={{ flex: 1, gap: spacing[1] }}>
          <Text
            variant="titleSmall"
            style={{ color: colors.primary, letterSpacing: 1 }}
          >
            {title.toUpperCase()}
          </Text>
          <Text
            variant="displaySmall"
            style={{ color: colors.onSurface, lineHeight: 36 }}
          >
            NÍVEL {level}
          </Text>
        </View>
      </View>

      <View style={{ gap: spacing[1] }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
            XP
          </Text>
          <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
            {progress.current} / {progress.needed}
          </Text>
        </View>
        <XpProgressBar current={progress.current} needed={progress.needed} />
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          paddingTop: spacing[1],
          borderTopWidth: 1,
          borderTopColor: colors.outlineVariant,
        }}
      >
        <StatPill label="TREINOS" value={String(totalWorkouts)} color={colors.primary} />
        <StatPill label="STREAK" value={`${streakDays}d`} color={colors.amber} />
        <StatPill label="CONQUISTAS" value={String(unlockedCount)} color={colors.green} />
      </View>
    </View>
  );
}

function StatPill({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={{ alignItems: 'center', gap: 2 }}>
      <Text variant="titleMedium" style={{ color }}>
        {value}
      </Text>
      <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
        {label}
      </Text>
    </View>
  );
}
