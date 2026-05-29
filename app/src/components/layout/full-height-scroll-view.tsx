import { useAppTheme } from '@/hooks/useAppTheme';
import { useScroll } from '@/hooks/useScrollListener';
import { HeaderHeightContext } from '@react-navigation/elements';
import { useContext, useState } from 'react';
import { View, StyleProp, ViewStyle, Platform } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FullHeightScrollView({
  children,
  floatingChildren,
  scrollStyle,
  avoidKeyboard,
  contentContainerStyle,
}: {
  children: React.ReactNode;
  floatingChildren?: React.ReactNode;
  avoidKeyboard?: boolean;
  scrollStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}) {
  const { colors } = useAppTheme();
  const { handleScroll } = useScroll();
  const [floatingBottomSize, setFloatingBottomSize] = useState(0);
  const insets = useSafeAreaInsets();
  const headerHeight = useContext(HeaderHeightContext); // Intentionally don't use useHeaderHeight as it might not be in a stack
  const topInsetHeight = Platform.select({ ios: headerHeight }) ?? 0;
  const bottomInsetHeight =
    floatingBottomSize + (Platform.select({ ios: insets.bottom }) ?? 0);

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
          onScroll={handleScroll}
          style={[scrollStyle]}
          contentContainerStyle={[contentContainerStyle]}
        >
          <View style={{ height: topInsetHeight }} />
          {children}
          <View style={{ height: bottomInsetHeight }} />
        </ScrollView>
      ) : (
        <KeyboardAwareScrollView
          ScrollViewComponent={ScrollView}
          onScroll={handleScroll}
          style={[scrollStyle]}
          contentContainerStyle={[contentContainerStyle]}
        >
          <View style={{ height: topInsetHeight }} />
          {children}
          <View style={{ height: bottomInsetHeight }} />
        </KeyboardAwareScrollView>
      )}
      {floatingChildren && (
        <View
          onLayout={(event) =>
            setFloatingBottomSize(event.nativeEvent.layout.height)
          }
          style={{
            position: 'absolute',
            bottom: Platform.select({ ios: insets.bottom }) ?? 0,
            width: '100%',
          }}
        >
          {floatingChildren}
        </View>
      )}
    </View>
  );
}
