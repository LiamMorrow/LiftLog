import { useAppTheme } from '@/hooks/useAppTheme';
import { useScroll } from '@/hooks/useScrollListener';
import { useState } from 'react';
import { View, StyleProp, ViewStyle, Platform, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Edges, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FullHeightScrollView({
  children,
  floatingChildren,
  scrollRef,
  scrollStyle,
  avoidKeyboard,
  contentContainerStyle,
  safeAreaEdges = { left: 'additive', right: 'additive', top: 'off', bottom: 'off' },
  onScroll,
}: {
  children: React.ReactNode;
  floatingChildren?: React.ReactNode;
  scrollRef?: React.Ref<ScrollView>;
  avoidKeyboard?: boolean;
  scrollStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  safeAreaEdges?: Edges;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}) {
  const { colors } = useAppTheme();
  const { handleScroll } = useScroll();
  const [floatingBottomSize, setFloatingBottomSize] = useState(0);
  const insets = useSafeAreaInsets();
  const bottomInsetHeight = floatingBottomSize;
  const handleCombinedScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    handleScroll(event);
    onScroll?.(event);
  };

  return (
    <SafeAreaView
      edges={safeAreaEdges}
      style={[
        {
          backgroundColor: colors.surface,
          flex: 1,
        },
      ]}
    >
      {!avoidKeyboard ? (
        <ScrollView
          ref={scrollRef}
          onScroll={handleCombinedScroll}
          style={[scrollStyle]}
          contentContainerStyle={[contentContainerStyle]}
        >
          {children}
          <View style={{ height: bottomInsetHeight }} />
        </ScrollView>
      ) : (
        <KeyboardAwareScrollView
          // @ts-expect-error -- Scrollview keeps flitting between compat and not
          ScrollViewComponent={ScrollView}
          ref={scrollRef as never}
          onScroll={handleCombinedScroll}
          style={[scrollStyle]}
          contentContainerStyle={[contentContainerStyle]}
        >
          {children}
          <View style={{ height: bottomInsetHeight }} />
        </KeyboardAwareScrollView>
      )}
      {floatingChildren && (
        <View
          onLayout={(event) => setFloatingBottomSize(event.nativeEvent.layout.height)}
          style={{
            position: 'absolute',
            bottom: Platform.select({ ios: insets.bottom }) ?? 0,
            width: '100%',
          }}
        >
          {floatingChildren}
        </View>
      )}
    </SafeAreaView>
  );
}
