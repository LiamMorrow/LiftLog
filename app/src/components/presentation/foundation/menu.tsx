import { MenuProps } from '@/components/presentation/foundation/menu-props';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Button, Host, Menu as NativeMenu } from '@expo/ui/swift-ui';
import { disabled, frame } from '@expo/ui/swift-ui/modifiers';

export default function Menu({ trigger, items, testID, size = 40 }: MenuProps) {
  const { colors } = useAppTheme();

  return (
    <Host style={{ width: size, height: size, margin: 6 }} seedColor={colors.seedColor}>
      <NativeMenu label={trigger(() => {})} testID={testID} modifiers={[frame({ width: size, height: size })]}>
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
    </Host>
  );
}
