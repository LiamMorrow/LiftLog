import AchievementBadge from '@/components/presentation/rpg/AchievementBadge';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { useAppSelector } from '@/store';
import { selectAllAchievements } from '@/store/rpg';
import { FlatList, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';

export default function AchievementsRow() {
  const { colors } = useAppTheme();
  const achievements = useAppSelector(selectAllAchievements);
  const unlocked = achievements.filter((a) => a.unlockedAt).length;

  return (
    <View style={{ gap: spacing[3] }}>
      <View
        style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}
      >
        <Icon source="workspacePremium" size={20} color={colors.amber} />
        <Text
          variant="titleSmall"
          style={{ color: colors.amber, letterSpacing: 1 }}
        >
          CONQUISTAS
        </Text>
        <Text
          variant="labelSmall"
          style={{ color: colors.onSurfaceVariant, marginLeft: 'auto' }}
        >
          {unlocked}/{achievements.length}
        </Text>
      </View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={achievements}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: spacing[3] }}
        renderItem={({ item }) => (
          <AchievementBadge
            id={item.id}
            name={item.name}
            description={item.description}
            icon={item.icon}
            unlockedAt={item.unlockedAt}
          />
        )}
      />
    </View>
  );
}
