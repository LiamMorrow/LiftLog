import { ReactNode } from 'react';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { Platform, StyleProp, useWindowDimensions, View, ViewStyle } from 'react-native';
import { GlassBackground } from '@/components/presentation/foundation/glass-background';
import { floatingShadowStyle } from '@/components/presentation/foundation/floating-shadow';
import { withAlpha } from '@/utils/color';

const barRadius = spacing[5];

interface FloatingPaneProps {
  children: ReactNode;
  testID?: string;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

/** The glass bar that floats above a workout's page actions. */
export function FloatingPane({ children, testID, style, contentStyle }: FloatingPaneProps) {
  const { colors } = useAppTheme();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  return (
    // Nothing clips the bar, so news shown in it, such as a cheer's emoji, can rise out of it. On iOS the glass
    // rounds itself and the lift comes from a wrapper; Android paints and lifts the bar itself.
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
        style={[
          {
            borderRadius: barRadius,
            paddingVertical: spacing[2],
            paddingLeft: spacing[4],
            paddingRight: spacing[2],
            gap: spacing[1],
          },
          Platform.OS === 'android'
            ? {
                backgroundColor: colors.surfaceContainerHigh,
                borderColor: colors.outlineVariant,
                borderWidth: 1,
                elevation: 2,
              }
            : undefined,
          contentStyle,
        ]}
      >
        {Platform.OS === 'ios' ? (
          <GlassBackground
            radius={barRadius}
            color={colors.surfaceContainerHigh}
            tintColor={withAlpha(colors.surfaceContainerHigh, 0.75)}
          />
        ) : undefined}
        {children}
      </View>
    </View>
  );
}
