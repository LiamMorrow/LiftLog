import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useTranslate } from '@tolgee/react';
import { Link, Stack } from 'expo-router';
import { Text } from 'react-native';

export default function Settings() {
  const { t } = useTranslate();
  const { colors } = useAppTheme();
  return (
    <FullHeightScrollView>
      <Stack.Screen options={{ title: t('Settings') }} />

      <Text style={{ color: colors.onSurface }}>
        <Link href="/settings/app-configuration">Hi</Link>
      </Text>
    </FullHeightScrollView>
  );
}
