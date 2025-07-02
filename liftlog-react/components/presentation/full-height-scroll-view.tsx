import { useAppTheme } from '@/hooks/useAppTheme';
import { useScroll } from '@/hooks/useScollListener';
import { useState } from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function FullHeightScrollView({
  children,
  floatingChildren,
  setIsScrolled: propsSetIsScrolled,
  scrollStyle,
  contentContainerStyle,
}: {
  children: React.ReactNode;
  floatingChildren?: React.ReactNode;
  setIsScrolled?: (isScrolled: boolean) => void;
  scrollStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}) {
  const { colors } = useAppTheme();
  const { handleScroll } = useScroll();
  const [floatingBottomSize, setFloatingBottomSize] = useState(0);

  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          flex: 1,
        },
      ]}
    >
      <KeyboardAwareScrollView
        onScroll={handleScroll}
        enableOnAndroid
        style={[scrollStyle]}
        contentContainerStyle={[contentContainerStyle]}
      >
        {children}
        <View style={{ height: floatingBottomSize }} />
      </KeyboardAwareScrollView>
      {floatingChildren && (
        <View
          onLayout={(event) =>
            setFloatingBottomSize(event.nativeEvent.layout.height)
          }
          style={{ position: 'absolute', bottom: 0, width: '100%' }}
        >
          {floatingChildren}
        </View>
      )}
    </View>
  );
}
