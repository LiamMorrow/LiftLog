import { useAppTheme } from '@/hooks/useAppTheme';
import { useScroll } from '@/hooks/useScrollListener';
import { useState } from 'react';
import { View, StyleProp, ViewStyle, ScrollViewProps } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

export default function FullHeightScrollView({
  children,
  floatingChildren,
  scrollStyle,
  contentContainerStyle,
}: {
  children: React.ReactNode;
  floatingChildren?: React.ReactNode;
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
        ScrollViewComponent={ScrollView as React.ComponentType<ScrollViewProps>}
        onScroll={handleScroll}
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
