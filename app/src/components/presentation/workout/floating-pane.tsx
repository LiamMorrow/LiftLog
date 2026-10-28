import { ReactNode } from 'react';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { Platform, useWindowDimensions, View, ViewStyle } from 'react-native';
import { GlassBackground } from '@/components/presentation/foundation/glass-background';
import { floatingShadowStyle } from '@/components/presentation/foundation/floating-shadow';

const barRadius = spacing[5];

interface FloatingPaneProps {
  children: ReactNode;
  testID?: string;
  style?: ViewStyle;
}

/** The glass bar that floats above a workout's page actions. */
export function FloatingPane({ children, testID, style }: FloatingPaneProps) {
  const { colors } = useAppTheme();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  return (
    // The glass rounds itself, so the bar does not clip: news shown in it, such as a cheer's emoji, can rise
    // out of it. The lift comes from a wrapper, and Android separates itself with a hairline instead.
    <View
      style={[
        {
          alignSelf: isLandscape ? 'flex-end' : 'stretch',
          // Separates the bar from the action floating above it, which the shared gap alone leaves too tight.
          marginTop: spacing[2],
        },
        Platform.OS === 'ios' ? floatingShadowStyle : undefined,
        style,
      ]}
    >
      <View
        testID={testID}
        style={{
          borderRadius: barRadius,
          paddingVertical: spacing[2],
          paddingLeft: spacing[4],
          paddingRight: spacing[2],
          gap: spacing[1],
          borderColor: colors.outlineVariant,
          borderWidth: Platform.OS === 'android' ? 1 : 0,
        }}
      >
        <GlassBackground
          radius={barRadius}
          color={colors.surfaceContainerHigh}
          tintColor={withAlpha(colors.surfaceContainerHigh, 0.75)}
        />
        {children}
      </View>
    </View>
  );
}

function withAlpha(hex: string, alpha: number): string {
  const a = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${a}`;
}
