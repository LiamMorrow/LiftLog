import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Icon, Modal, Portal, Text } from 'react-native-paper';

interface AchievementBadgeProps {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export default function AchievementBadge({
  name,
  description,
  icon,
  unlockedAt,
}: AchievementBadgeProps) {
  const { colors } = useAppTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const unlocked = !!unlockedAt;

  return (
    <>
      <Pressable onPress={() => setModalVisible(true)}>
        <View
          style={{
            alignItems: 'center',
            gap: spacing[1],
            width: 72,
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 4,
              backgroundColor: unlocked
                ? colors.primaryContainer
                : colors.surfaceVariant,
              borderWidth: 1,
              borderColor: unlocked ? colors.primary : colors.outline,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: unlocked ? 1 : 0.4,
            }}
          >
            <Icon
              source={unlocked ? icon : 'lock'}
              size={24}
              color={unlocked ? colors.primary : colors.onSurfaceVariant}
            />
          </View>
          <Text
            variant="labelSmall"
            style={{
              color: unlocked ? colors.onSurface : colors.onSurfaceVariant,
              textAlign: 'center',
              opacity: unlocked ? 1 : 0.5,
            }}
            numberOfLines={2}
          >
            {name}
          </Text>
        </View>
      </Pressable>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={{
            backgroundColor: colors.surface,
            margin: spacing[6],
            borderRadius: 4,
            padding: spacing[6],
            borderWidth: 1,
            borderColor: unlocked ? colors.primary : colors.outline,
            gap: spacing[3],
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 4,
              backgroundColor: unlocked ? colors.primaryContainer : colors.surfaceVariant,
              borderWidth: 1,
              borderColor: unlocked ? colors.primary : colors.outline,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon
              source={unlocked ? icon : 'lock'}
              size={36}
              color={unlocked ? colors.primary : colors.onSurfaceVariant}
            />
          </View>
          <Text variant="titleMedium" style={{ color: colors.onSurface, textAlign: 'center' }}>
            {name}
          </Text>
          <Text
            variant="bodyMedium"
            style={{ color: colors.onSurfaceVariant, textAlign: 'center' }}
          >
            {description}
          </Text>
          {unlocked && unlockedAt && (
            <Text variant="labelSmall" style={{ color: colors.green }}>
              DESBLOQUEADA ✓
            </Text>
          )}
          {!unlocked && (
            <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
              BLOQUEADA
            </Text>
          )}
        </Modal>
      </Portal>
    </>
  );
}
