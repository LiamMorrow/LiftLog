import { InlineHost } from '@/components/presentation/foundation/inline-host';
import { MenuProps } from './menu-props';
import { nativeIconButtonHostStyle, nativeIconButtonSize } from '../native-icon-button/native-icon-button-props';
import { SwiftIconButtonImage, swiftIconButtonModifiers } from '../native-icon-button/swift-icon-button';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Button, Menu as NativeMenu } from '@expo/ui/swift-ui';
import { accessibilityIdentifier, accessibilityLabel, disabled, menuStyle } from '@expo/ui/swift-ui/modifiers';

export default function Menu({ trigger, items }: MenuProps) {
  const { colors } = useAppTheme();

  return (
    <InlineHost style={nativeIconButtonHostStyle({})}>
      <NativeMenu
        label={<SwiftIconButtonImage {...trigger} boxSize={nativeIconButtonSize()} theme={colors} />}
        modifiers={[
          menuStyle('button'),
          ...swiftIconButtonModifiers(trigger, colors),
          accessibilityLabel(trigger.label),
          ...(trigger.testID ? [accessibilityIdentifier(trigger.testID)] : []),
        ]}
      >
        {items.map((item) => (
          <Button
            key={item.label}
            role={item.destructive ? 'destructive' : undefined}
            systemImage={item.systemImage}
            label={item.label}
            onPress={item.onPress}
            modifiers={item.disabled ? [disabled(true)] : undefined}
          />
        ))}
      </NativeMenu>
    </InlineHost>
  );
}
