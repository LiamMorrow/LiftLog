import { useAppTheme } from '@/hooks/useAppTheme';
import { useScroll } from '@/hooks/useScrollListener';
import { useState } from 'react';
import {
  NativeSyntheticEvent,
  StyleProp,
  View,
  ViewStyle,
  NativeScrollEvent,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import type { AnimatedScrollViewComponent } from 'react-native-keyboard-controller/lib/typescript/components/ScrollViewWithBottomPadding';

export default function FullHeightScrollView({
  children,
  floatingChildren,
  scrollStyle,
  avoidKeyboard,
  contentContainerStyle,
  onScroll,
}: {
  children: React.ReactNode;
  floatingChildren?: React.ReactNode;
  avoidKeyboard?: boolean;
  scrollStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}) {
  const { colors } = useAppTheme();
  const { handleScroll } = useScroll();
  const [floatingBottomSize, setFloatingBottomSize] = useState(0);
  const handleCombinedScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    handleScroll(event);
    onScroll?.(event);
  };

  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          flex: 1,
        },
      ]}
    >
      {!avoidKeyboard ? (
        <ScrollView
          onScroll={handleCombinedScroll}
          style={[scrollStyle]}
          contentContainerStyle={[contentContainerStyle]}
        >
          {children}
          <View style={{ height: floatingBottomSize }} />
        </ScrollView>
      ) : (
        <KeyboardAwareScrollView
          ScrollViewComponent={ScrollView as AnimatedScrollViewComponent}
          onScroll={handleCombinedScroll}
          style={[scrollStyle]}
          contentContainerStyle={[contentContainerStyle]}
        >
          {children}
          <View style={{ height: floatingBottomSize }} />
        </KeyboardAwareScrollView>
      )}
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
