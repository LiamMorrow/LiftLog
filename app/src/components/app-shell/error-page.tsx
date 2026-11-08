import { ReportProblemActions } from '@/components/app-shell/report-problem-actions';
import { AppText } from '@/components/foundation/app-text';
import { NativeIcon } from '@/components/foundation/native-icon';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { useMountEffect } from '@/hooks/useMountEffect';
import ErrorIcon from '@expo/material-symbols/error.xml';
import { useTranslate } from '@tolgee/react';
import * as SplashScreen from 'expo-splash-screen';
import { StyleSheet, View } from 'react-native';

export function ErrorPage() {
  const { colors } = useAppTheme();
  const { t } = useTranslate();

  useMountEffect(() => {
    SplashScreen.hide();
  });

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
          padding: spacing[6],
          gap: spacing[2],
        },
      ]}
    >
      <NativeIcon icon={ErrorIcon} systemImage="exclamationmark.triangle" size={48} color={colors.error} />
      <AppText variant="headlineSmall" style={{ textAlign: 'center' }}>
        {t('app.error_page.title')}
      </AppText>
      <AppText variant="bodyMedium" color="onSurfaceVariant" style={{ textAlign: 'center' }}>
        {t('app.error_page.message')}
      </AppText>
      <ReportProblemActions />
    </View>
  );
}
