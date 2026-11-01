import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { ReactNode } from 'react';
import { View, ViewStyle } from 'react-native';
import { AppText } from '@/components/presentation/foundation/app-text';

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
      <AppText variant="titleMedium" numberOfLines={1} style={{ flexShrink: 1 }}>
        {title}
      </AppText>
      {typeof trailing === 'string' ? (
        <AppText variant="bodyMedium" numberOfLines={1} style={{ flexShrink: 1, color: colors.onSurfaceVariant }}>
          {trailing}
        </AppText>
      ) : (
        trailing
      )}
    </View>
  );
}
