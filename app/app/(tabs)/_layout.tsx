import { useAppTheme } from '@/hooks/useAppTheme';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  const { colors } = useAppTheme();
  return (
    <NativeTabs
      backgroundColor={colors.surfaceContainer}
      indicatorColor={colors.secondaryContainer}
      iconColor={colors.onSurfaceVariant}
      labelStyle={{
        color: colors.onSurfaceVariant,
      }}
      blurEffect="dark"
    >
      <NativeTabs.Trigger name="(session)">
        <Icon
          selectedColor={colors.onSecondaryContainer}
          sf="house.fill"
          drawable="home"
        />
        <Label
          selectedStyle={{
            color: colors.secondary,
          }}
        >
          Home
        </Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <Icon
          selectedColor={colors.onSecondaryContainer}
          sf="gear"
          drawable="settings"
        />
        <Label
          selectedStyle={{
            color: colors.secondary,
          }}
        >
          Settings
        </Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
