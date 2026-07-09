import Icon from '@/components/presentation/foundation/gesture-wrappers/icon';
import { MenuProps } from '@/components/presentation/foundation/menu-props';
import { useAppTheme } from '@/hooks/useAppTheme';
import { DropdownMenu, DropdownMenuItem, Host, Text } from '@expo/ui/jetpack-compose';
import { useState } from 'react';

export default function Menu({ trigger, items }: MenuProps) {
  const { colors } = useAppTheme();
  const [expanded, setExpanded] = useState(false);

  return (
    <Host matchContents style={{ margin: 6 }} seedColor={colors.primary}>
      <DropdownMenu expanded={expanded} onDismissRequest={() => setExpanded(false)}>
        <DropdownMenu.Trigger>{trigger(() => setExpanded(true))}</DropdownMenu.Trigger>
        <DropdownMenu.Items>
          {items.map((item) => (
            <DropdownMenuItem
              key={item.label}
              enabled={item.disabled ? false : true}
              elementColors={item.destructive ? { textColor: colors.error, leadingIconColor: colors.error } : undefined}
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
  );
}
