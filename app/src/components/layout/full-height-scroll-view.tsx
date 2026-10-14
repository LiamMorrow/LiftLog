import { useAppTheme } from '@/hooks/useAppTheme';
import { useScroll } from '@/hooks/useScrollListener';
import { HeaderHeightContext } from 'expo-router/react-navigation';
import { useContext, useState } from 'react';
import { View, StyleProp, ViewStyle, Platform } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FullHeightScrollView({
  children,
  floatingChildren,
  scrollRef,
  scrollStyle,
  avoidKeyboard,
  contentContainerStyle,
  modal,
}: {
  children: React.ReactNode;
  floatingChildren?: React.ReactNode;
  scrollRef?: React.Ref<ScrollView>;
  avoidKeyboard?: boolean;
  scrollStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  modal?: boolean;
}) {
  const { colors } = useAppTheme();
  const { handleScroll } = useScroll();
  const [floatingBottomSize, setFloatingBottomSize] = useState(0);
  const insets = useSafeAreaInsets();
  const bottomInsetHeight = floatingBottomSize;

  const headerHeight = useContext(HeaderHeightContext);
  const topInsetHeight = modal ? (Platform.select({ ios: headerHeight }) ?? 0) : 0;

  return (
    <SafeAreaView
      edges={{ left: 'additive', right: 'additive', top: 'off', bottom: 'off' }}
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
          onScroll={handleScroll}
          style={[scrollStyle]}
          contentContainerStyle={[{ insetBlockStart: topInsetHeight }, contentContainerStyle]}
        >
          {children}
          <View style={{ height: bottomInsetHeight }} />
        </ScrollView>
      ) : (
        <KeyboardAwareScrollView
          // @ts-expect-error -- Scrollview keeps flitting between compat and not
          ScrollViewComponent={ScrollView}
          ref={scrollRef as never}
          onScroll={handleScroll}
          style={[scrollStyle]}
          contentContainerStyle={[{ insetBlockStart: topInsetHeight }, contentContainerStyle]}
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
            bottom: modal || Platform.OS === 'ios' ? insets.bottom : 0,
            width: '100%',
          }}
        >
          {floatingChildren}
        </View>
      )}
    </SafeAreaView>
  );
}
