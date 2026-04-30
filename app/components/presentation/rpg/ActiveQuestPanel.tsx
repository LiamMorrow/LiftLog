import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { useAppSelector } from '@/store';
import { selectActiveQuests } from '@/store/rpg';
import { View } from 'react-native';
import { Icon, ProgressBar, Text } from 'react-native-paper';

export default function ActiveQuestPanel() {
  const { colors } = useAppTheme();
  const quests = useAppSelector(selectActiveQuests);

  if (!quests.length) return null;

  return (
    <View
      style={{
        backgroundColor: colors.surfaceContainer,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.outlineVariant,
        padding: spacing[4],
        gap: spacing[3],
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
        <Icon source="menuBook" size={20} color={colors.primary} />
        <Text variant="titleSmall" style={{ color: colors.primary, letterSpacing: 1 }}>
          MISSÕES DA SEMANA
        </Text>
      </View>

      {quests.map((quest) => {
        const ratio = quest.target > 0 ? quest.progress / quest.target : 0;
        const isDone = !!quest.completedAt;
        return (
          <View key={quest.id} style={{ gap: spacing[1] }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing[1],
                  flex: 1,
                }}
              >
                {isDone && (
                  <Icon source="checkCircle" size={14} color={colors.green} />
                )}
                <Text
                  variant="bodyMedium"
                  style={{
                    color: isDone ? colors.onSurfaceVariant : colors.onSurface,
                    textDecorationLine: isDone ? 'line-through' : 'none',
                    flex: 1,
                  }}
                  numberOfLines={1}
                >
                  {quest.description}
                </Text>
              </View>
              <Text
                variant="labelSmall"
                style={{ color: colors.amber, marginLeft: spacing[2] }}
              >
                +{quest.xpReward} XP
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
              <ProgressBar
                progress={Math.min(ratio, 1)}
                color={isDone ? colors.green : colors.primary}
                style={{ flex: 1, height: 4, borderRadius: 2 }}
              />
              <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
                {quest.progress}/{quest.target}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
