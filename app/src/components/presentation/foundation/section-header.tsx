import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { ReactNode } from 'react';
import { View, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';

export function SectionHeader({ title, trailing, style }: { title: string; trailing?: ReactNode; style?: ViewStyle }) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: typeof trailing === 'string' ? 'baseline' : 'center',
          justifyContent: 'space-between',
          gap: spacing[4],
        },
        style,
      ]}
    >
      <Text variant="titleMedium" numberOfLines={1} style={{ flexShrink: 1 }}>
        {title}
      </Text>
      {typeof trailing === 'string' ? (
        <Text variant="bodyMedium" numberOfLines={1} style={{ flexShrink: 1, color: colors.onSurfaceVariant }}>
          {trailing}
        </Text>
      ) : (
        trailing
      )}
    </View>
  );
}
