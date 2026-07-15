import { ScrollProvider, useScroll } from '@/hooks/useScrollListener';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Stack } from 'expo-router';
import { ReactNode } from 'react';
import { Platform } from 'react-native';

export default function StackWithHeader(props: { children?: ReactNode }) {
  return (
    <ScrollProvider>
      <ScrollAwareStack>{props.children}</ScrollAwareStack>
    </ScrollProvider>
  );
}

function ScrollAwareStack({ children }: { children?: ReactNode }) {
  const { isScrolled } = useScroll();
  const { colors } = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        headerTitleAlign: 'center',
        // Tint the native header rather than supplying a `headerBackground`. A headerBackground makes
        // expo-router mark the header translucent, which lets react-native-screens size the content to the
        // full height and leaves expo-router to offset it by the header height on the JS side. Those two go
        // out of sync on Android when a covered screen is rebuilt (e.g. rotating with a screen pushed on
        // top), and the content ends up a header shorter than the screen.
        headerStyle:
          Platform.OS === 'ios'
            ? undefined
            : { backgroundColor: isScrolled ? colors.surfaceContainer : colors.surface },
        gestureEnabled: true,
        headerTransparent: Platform.OS === 'ios',
      }}
    >
      {children}
    </Stack>
  );
}
