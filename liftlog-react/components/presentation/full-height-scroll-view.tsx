import { useAppTheme } from '@/hooks/useAppTheme';
import { useScroll } from '@/hooks/useScollListener';
import { useEffect, useState } from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function FullHeightScrollView({
  children,
  floatingChildren,
  setIsScrolled: propsSetIsScrolled,
  scrollStyle,
}: {
  children: React.ReactNode;
  floatingChildren?: React.ReactNode;
  setIsScrolled?: (isScrolled: boolean) => void;
  scrollStyle?: StyleProp<ViewStyle>;
}) {
  const { colors } = useAppTheme();
  const { setScrolled: dispatchSetIsScrolled } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [floatingBottomSize, setFloatingBottomSize] = useState(0);

  // Effect basically ensures we only emit when isScrolled changes so our parents don't need to care
  useEffect(() => {
    (propsSetIsScrolled ?? dispatchSetIsScrolled)(isScrolled);
  }, [dispatchSetIsScrolled, isScrolled, propsSetIsScrolled]);

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
        onScroll={(e) => setIsScrolled(e.nativeEvent.contentOffset.y > 0)}
        enableOnAndroid={true}
        style={[scrollStyle]}
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
