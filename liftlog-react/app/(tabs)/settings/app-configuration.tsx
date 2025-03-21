import { useTranslate } from '@tolgee/react';
import { Stack } from 'expo-router';
import { View } from 'react-native';

export default function AppConfiguration() {
  const { t } = useTranslate();

  return (
    <View>
      <Stack.Screen options={{ title: t('AppConfiguration') }} />
    </View>
  );
}
