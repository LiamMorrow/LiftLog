import { useAppTheme } from '@/hooks/useAppTheme';
import { useScroll } from '@/hooks/useScollListener';
import { useEffect, useState } from 'react';
import { View, ScrollView, StyleProp, ViewStyle } from 'react-native';

export default function FullHeightScrollView({
  children,
  afterScrollChildren,
  setIsScrolled: propsSetIsScrolled,
  scrollStyle,
}: {
  children: React.ReactNode;
  afterScrollChildren?: React.ReactNode;
  setIsScrolled?: (isScrolled: boolean) => void;
  scrollStyle?: StyleProp<ViewStyle>;
}) {
  const { colors } = useAppTheme();
  const { setScrolled: dispatchSetIsScrolled } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  // Effect basically ensures we only emit when isScrolled changes so our parents don't need to care
  useEffect(() => {
    (propsSetIsScrolled ?? dispatchSetIsScrolled)(isScrolled);
  }, [dispatchSetIsScrolled, isScrolled, propsSetIsScrolled]);

  return (
    <View
      style={[
        {
          position: 'relative',
          backgroundColor: colors.surface,
          height: '100%',
        },
      ]}
    >
      <ScrollView
        onScroll={(e) => setIsScrolled(e.nativeEvent.contentOffset.y > 0)}
        style={[
          {
            height: '100%',
          },
          scrollStyle,
        ]}
      >
        {children}
      </ScrollView>
      {afterScrollChildren}
    </View>
  );
}
