import { Stack } from 'expo-router';
import { AppThemeProvider } from '@/hooks/useAppTheme';
import { I18nManager, LogBox, Platform, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { AppStateProvider } from '@/components/smart/app-state-provider';
import SnackbarProvider from '@/components/smart/snackbar-provider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import '@/utils/date-locale';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import * as Sentry from '@sentry/react-native';
import ServicesProvider from '@/components/smart/services-provider';
import { useFonts } from 'expo-font';
import { PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import { VT323_400Regular } from '@expo-google-fonts/vt323';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

void SplashScreen.preventAutoHideAsync();

LogBox.ignoreLogs([
  /.*is not a valid icon name.*/,
  /Open debugger to view warnings./,
  /.*useInsertionEffect.*/,
  /.*Failed to fetch inbox.*/,
  /.*Failed to update profile*/,
]);

if (Platform.OS === 'android') {
  I18nManager.swapLeftAndRightInRTL(true);
}

export default Sentry.wrap(function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    PressStart2P_400Regular,
    VT323_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView>
      <KeyboardProvider>
        <Provider store={store}>
          <SafeAreaProvider>
            <ServicesProvider>
              <AppThemeProvider>
                <AppStateProvider>
                  <SnackbarProvider>
                    <Stack
                      screenOptions={{
                        headerShown: false,
                        statusBarStyle:
                          Platform.OS === 'android'
                            ? colorScheme === 'dark'
                              ? 'light'
                              : 'dark'
                            : undefined,
                        gestureEnabled: false,
                      }}
                    />
                  </SnackbarProvider>
                </AppStateProvider>
              </AppThemeProvider>
            </ServicesProvider>
          </SafeAreaProvider>
        </Provider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
});
