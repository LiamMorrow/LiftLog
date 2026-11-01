import { AppText } from '@/components/presentation/foundation/app-text';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { useAppSelector } from '@/store';
import { SnackbarDescriptor, setCurrentSnackbar } from '@/store/app';
import { withAlpha } from '@/utils/color';
import { ReactNode, useEffect, useState } from 'react';
import { Animated, Platform, Pressable, useAnimatedValue, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';

export function SnackbarProvider(props: { children: ReactNode }) {
  const currentSnackbar = useAppSelector((s) => s.app.currentSnackbar);
  const [shown, setShown] = useState<SnackbarDescriptor>();
  const opacity = useAnimatedValue(0);
  if (currentSnackbar && currentSnackbar !== shown) {
    setShown(currentSnackbar);
  }

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: currentSnackbar ? 1 : 0,
      duration: currentSnackbar ? 200 : 100,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && !currentSnackbar) {
        setShown(undefined);
      }
    });
  }, [currentSnackbar, opacity]);

  return (
    <>
      {props.children}
      {shown && <Snackbar descriptor={shown} opacity={opacity} interactive={!!currentSnackbar} />}
    </>
  );
}

function Snackbar({
  descriptor,
  opacity,
  interactive,
}: {
  descriptor: SnackbarDescriptor;
  opacity: Animated.Value;
  interactive: boolean;
}) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();

  const runAction = () => {
    if (descriptor.onAction) {
      descriptor.onAction();
    } else if (Array.isArray(descriptor.dispatchAction)) {
      descriptor.dispatchAction.forEach((x) => dispatch(x));
    } else if (descriptor.dispatchAction) {
      dispatch(descriptor.dispatchAction);
    }
    dispatch(setCurrentSnackbar(undefined));
  };

  return (
    <Animated.View
      pointerEvents={interactive ? 'box-none' : 'none'}
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: insets.bottom,
        padding: spacing[2],
        opacity,
        transform: [{ scale: opacity.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }],
      }}
    >
      <View
        accessibilityLiveRegion="polite"
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          minHeight: 48,
          borderRadius: 4,
          backgroundColor: colors.inverseSurface,
          elevation: 3,
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
        }}
      >
        <AppText
          variant="bodyMedium"
          color="inverseOnSurface"
          style={{ flex: 1, marginVertical: 14, marginHorizontal: spacing[4] }}
        >
          {descriptor.text}
        </AppText>
        {descriptor.action && (
          <Pressable
            role="button"
            onPress={runAction}
            android_ripple={{ color: withAlpha(colors.inversePrimary, 0.12) }}
            style={({ pressed }) => ({
              marginRight: spacing[2],
              paddingHorizontal: spacing[3],
              paddingVertical: 10,
              borderRadius: 20,
              opacity: Platform.OS === 'ios' && pressed ? 0.6 : 1,
            })}
          >
            <AppText variant="labelLarge" color="inversePrimary">
              {descriptor.action}
            </AppText>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}
