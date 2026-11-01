import { nativeIconButtonHostStyle, nativeIconButtonSize, NativeIconButtonProps } from './native-icon-button-props';
import { SwiftIconButtonImage, swiftIconButtonModifiers } from './swift-icon-button';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Button, Host } from '@expo/ui/swift-ui';
import { accessibilityIdentifier, accessibilityLabel, disabled as disabledModifier } from '@expo/ui/swift-ui/modifiers';

export function NativeIconButton(props: NativeIconButtonProps) {
  const { colors } = useAppTheme();

  return (
    <Host seedColor={colors.seedColor} colorScheme={colors.scheme} style={nativeIconButtonHostStyle(props)}>
      <Button
        onPress={props.onPress}
        modifiers={[
          ...swiftIconButtonModifiers(props, colors),
          accessibilityLabel(props.label),
          ...(props.disabled ? [disabledModifier(true)] : []),
          ...(props.testID ? [accessibilityIdentifier(props.testID)] : []),
        ]}
      >
        <SwiftIconButtonImage {...props} boxSize={nativeIconButtonSize(props.iconSize)} theme={colors} />
      </Button>
    </Host>
  );
}
