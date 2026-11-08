import { PopoverProps } from './popover-props';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { Host, Popover as NativePopover, Rectangle, RNHostView } from '@expo/ui/swift-ui';
import { opacity } from '@expo/ui/swift-ui/modifiers';
import { useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

export function Popover({ trigger, children, width = 300 }: PopoverProps) {
  const { colors } = useAppTheme();
  const window = useWindowDimensions();
  const [isPresented, setIsPresented] = useState(false);

  return (
    <View style={{ maxWidth: '100%' }}>
      <Host style={StyleSheet.absoluteFill} seedColor={colors.seedColor} colorScheme={colors.scheme}>
        <NativePopover isPresented={isPresented} onIsPresentedChange={setIsPresented}>
          <NativePopover.Trigger>
            <Rectangle modifiers={[opacity(0)]} />
          </NativePopover.Trigger>
          <NativePopover.Content>
            <RNHostView matchContents>
              <View style={{ width: Math.min(width, window.width - spacing[4] * 2), padding: spacing[4] }}>
                {children(() => setIsPresented(false))}
              </View>
            </RNHostView>
          </NativePopover.Content>
        </NativePopover>
      </Host>
      {trigger(() => setIsPresented(true))}
    </View>
  );
}
