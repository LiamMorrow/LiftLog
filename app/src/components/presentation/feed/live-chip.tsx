import { AppText } from '@/components/presentation/foundation/app-text';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { View, ViewStyle } from 'react-native';

export function LiveChip({ label, style }: { label: string; style?: ViewStyle }) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing[1],
          height: 24,
          paddingLeft: spacing[2],
          paddingRight: spacing[3],
          borderRadius: 12,
          backgroundColor: colors.inverseSurface,
        },
        style,
      ]}
    >
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.inverseOnSurface }} />
      <AppText variant="labelMedium" color="inverseOnSurface">
        {label}
      </AppText>
    </View>
  );
}
