import { InlineHost } from '@/components/presentation/foundation/inline-host';
import { nativeIconButtonHostStyle, nativeIconButtonSize, NativeIconButtonProps } from './native-icon-button-props';
import { SwiftIconButtonImage, swiftIconButtonModifiers } from './swift-icon-button';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Button } from '@expo/ui/swift-ui';
import { accessibilityIdentifier, accessibilityLabel, disabled as disabledModifier } from '@expo/ui/swift-ui/modifiers';

export function NativeIconButton(props: NativeIconButtonProps) {
  const { colors } = useAppTheme();

  return (
    <InlineHost style={nativeIconButtonHostStyle(props)}>
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
    </InlineHost>
  );
}
