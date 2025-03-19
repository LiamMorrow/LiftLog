import { Stack } from 'expo-router';
import { AppThemeProvider } from '@/hooks/useAppTheme';
import { DevTools, FormatSimple, Tolgee, TolgeeProvider } from '@tolgee/react';
import { Text, useColorScheme } from 'react-native';
import en from '../i18n/en.json';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import store from '@/store';

const tolgee = Tolgee()
  // DevTools will work only for web view
  .use(DevTools())
  .use(FormatSimple())
  // replace with .use(FormatIcu()) for rendering plurals, formatted numbers, etc.
  .init({
    language: 'en',

    // for development
    apiUrl: process.env.EXPO_PUBLIC_TOLGEE_API_URL,
    apiKey: process.env.EXPO_PUBLIC_TOLGEE_API_KEY,
    staticData: {
      en,
    },
  });

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <TolgeeProvider tolgee={tolgee} fallback={<Text>Loading...</Text>}>
          <AppThemeProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                statusBarTranslucent: true,
                statusBarBackgroundColor: 'transparent',
                navigationBarTranslucent: true,
                statusBarStyle: colorScheme === 'dark' ? 'light' : 'dark',
              }}
            />
          </AppThemeProvider>
        </TolgeeProvider>
      </SafeAreaProvider>
    </Provider>
  );
}
