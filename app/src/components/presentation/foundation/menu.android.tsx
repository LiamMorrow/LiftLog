import Icon from '@/components/presentation/foundation/gesture-wrappers/icon';
import { MenuProps } from '@/components/presentation/foundation/menu-props';
import { useAppTheme } from '@/hooks/useAppTheme';
import { DropdownMenu, DropdownMenuItem, Host, Spacer, Text } from '@expo/ui/jetpack-compose';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

export default function Menu({ trigger, items }: MenuProps) {
  const { colors } = useAppTheme();
  const [expanded, setExpanded] = useState(false);

  return (
    <View>
      {trigger(() => setExpanded(true))}
      {/* Compose drops the contents of a host that mounts into, or is reattached to, an already
          attached view hierarchy, so the trigger stays outside of the host and the host only
          exists while the menu is open. The host instead fills the trigger's bounds, giving the
          menu an anchor of the same size to open beneath - it must not size to its contents,
          which would collapse the anchor to a point and open the menu beside the trigger. */}
      {expanded && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Host style={{ flex: 1 }} seedColor={colors.primary}>
            <DropdownMenu expanded onDismissRequest={() => setExpanded(false)}>
              <DropdownMenu.Trigger>
                <Spacer />
              </DropdownMenu.Trigger>
              <DropdownMenu.Items>
                {items.map((item) => (
                  <DropdownMenuItem
                    key={item.label}
                    enabled={item.disabled ? false : true}
                    elementColors={
                      item.destructive ? { textColor: colors.error, leadingIconColor: colors.error } : undefined
                    }
                    onClick={() => {
                      item.onPress();
                      setExpanded(false);
                    }}
                  >
                    {item.icon !== undefined && typeof item.icon !== 'function' && (
                      <DropdownMenuItem.LeadingIcon>
                        <Icon source={item.icon} size={24} />
                      </DropdownMenuItem.LeadingIcon>
                    )}
                    <DropdownMenuItem.Text>
                      <Text>{item.label}</Text>
                    </DropdownMenuItem.Text>
                  </DropdownMenuItem>
                ))}
              </DropdownMenu.Items>
            </DropdownMenu>
          </Host>
        </View>
      )}
    </View>
  );
}
