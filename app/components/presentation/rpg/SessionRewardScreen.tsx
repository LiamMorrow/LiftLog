import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { useAppSelector } from '@/store';
import { ACHIEVEMENTS, clearSessionReward } from '@/store/rpg';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Icon, Portal, Text } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import Button from '@/components/presentation/gesture-wrappers/button';

export default function SessionRewardScreen() {
  const { colors } = useAppTheme();
  const dispatch = useDispatch();
  const reward = useAppSelector((s) => s.rpg.lastSessionReward);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(60);

  useEffect(() => {
    if (!reward) return;
    opacity.value = withTiming(1, { duration: 350 });
    translateY.value = withTiming(0, { duration: 350 });
  }, [reward, opacity, translateY]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const dismiss = () => {
    opacity.value = withTiming(0, { duration: 250 });
    translateY.value = withTiming(40, { duration: 250 });
    setTimeout(() => dispatch(clearSessionReward()), 260);
  };

  if (!reward) return null;

  const newAchievements = reward.newAchievementIds
    .map((id) => ACHIEVEMENTS.find((a) => a.id === id))
    .filter(Boolean);

  return (
    <Portal>
      <View style={[StyleSheet.absoluteFill, styles.backdrop]}>
        <Animated.View
          style={[
            containerStyle,
            {
              backgroundColor: colors.surface,
              borderWidth: 2,
              borderColor: colors.primary,
              borderRadius: 4,
              padding: spacing[6],
              marginHorizontal: spacing[6],
              gap: spacing[5],
              alignItems: 'center',
            },
          ]}
        >
          <Icon source="checkCircle" size={48} color={colors.green} />
          <Text
            variant="headlineSmall"
            style={{ color: colors.onSurface, textAlign: 'center' }}
          >
            MISSÃO CONCLUÍDA
          </Text>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing[2],
              backgroundColor: colors.primaryContainer,
              paddingHorizontal: spacing[4],
              paddingVertical: spacing[2],
              borderRadius: 4,
            }}
          >
            <Icon source="star" size={20} color={colors.amber} />
            <Text variant="titleMedium" style={{ color: colors.amber }}>
              +{reward.xpGained} XP
            </Text>
          </View>

          {newAchievements.length > 0 && (
            <View style={{ width: '100%', gap: spacing[2] }}>
              <Text
                variant="labelSmall"
                style={{ color: colors.amber, textAlign: 'center', letterSpacing: 1 }}
              >
                CONQUISTAS DESBLOQUEADAS
              </Text>
              {newAchievements.map(
                (a) =>
                  a && (
                    <View
                      key={a.id}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: spacing[2],
                      }}
                    >
                      <Icon source={a.icon} size={16} color={colors.primary} />
                      <Text variant="bodyMedium" style={{ color: colors.onSurface }}>
                        {a.name}
                      </Text>
                    </View>
                  ),
              )}
            </View>
          )}

          <Button mode="contained" onPress={dismiss} style={{ width: '100%' }}>
            CONTINUAR
          </Button>
        </Animated.View>
      </View>
    </Portal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 998,
  },
});
