import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { PageAction, PageActionsProps } from '@/components/presentation/foundation/page-actions-props';
import { Button, HStack, Host } from '@expo/ui/swift-ui';
import { buttonStyle, foregroundStyle, glassEffect, padding, shadow } from '@expo/ui/swift-ui/modifiers';
import { floatingShadowModifier } from '@/components/presentation/foundation/floating-shadow';
import { View } from 'react-native';

// iOS draws a commit and a recurring action the same way, so `primaryKind` is unused here:
// emphasis comes from the glass tint rather than from a different control.
export function PageActions({ primary, secondary = [], accessory }: PageActionsProps) {
  const { colors } = useAppTheme();

  const glassButton = (action: PageAction, isPrimary: boolean) => (
    <Button
      key={action.label}
      label={action.label}
      systemImage={action.systemImage}
      onPress={action.onPress}
      modifiers={[
        buttonStyle('plain'),
        foregroundStyle(isPrimary ? colors.onPrimary : colors.primary),
        padding({ horizontal: 20, vertical: 14 }),
        glassEffect({
          glass: { variant: 'clear', interactive: true, tint: isPrimary ? colors.primary : undefined },
          shape: 'capsule',
        }),
      ]}
    />
  );

  return (
    <View
      style={{
        alignItems: 'center',
        gap: spacing[2],
        paddingHorizontal: spacing.pageHorizontalMargin,
        paddingBottom: spacing[3],
      }}
    >
      <Host matchContents seedColor={colors.seedColor}>
        {/* The shadow rides the stack, not the buttons: glass swallows a shadow set on itself. */}
        <HStack spacing={8} modifiers={[shadow(floatingShadowModifier)]}>
          {glassButton(primary, true)}
          {secondary.map((action) => glassButton(action, false))}
        </HStack>
      </Host>
      {accessory && <View style={{ alignSelf: 'stretch' }}>{accessory}</View>}
    </View>
  );
}
