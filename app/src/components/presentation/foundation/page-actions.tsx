import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { PageAction, PageActionsProps } from '@/components/presentation/foundation/page-actions-props';
import { Button, HStack, Host } from '@expo/ui/swift-ui';
import { buttonStyle, foregroundStyle, glassEffect, padding } from '@expo/ui/swift-ui/modifiers';
import { View } from 'react-native';

// iOS draws a commit and a recurring action the same way, so `primaryKind` is unused here:
// emphasis comes from the glass tint rather than from a different control.
export function PageActions({ primary, secondary = [] }: PageActionsProps) {
  const { colors } = useAppTheme();

  const glassButton = (action: PageAction, isPrimary: boolean) => (
    <Button
      key={action.label}
      label={action.label}
      systemImage={action.systemImage}
      testID={action.testID}
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
    <View style={{ alignItems: 'center', paddingHorizontal: spacing.pageHorizontalMargin, paddingBottom: spacing[3] }}>
      <Host matchContents seedColor={colors.seedColor}>
        <HStack spacing={8}>
          {glassButton(primary, true)}
          {secondary.map((action) => glassButton(action, false))}
        </HStack>
      </Host>
    </View>
  );
}
