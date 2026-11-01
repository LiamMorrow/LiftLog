import { AppText } from '@/components/presentation/foundation/app-text';
import { spacing } from '@/hooks/useAppTheme';
import { useTranslate } from '@tolgee/react';
import { View } from 'react-native';

export function UpdatePrompt() {
  const { t } = useTranslate();
  return (
    <View style={{ gap: spacing[2] }}>
      <AppText variant="titleMedium">{t('ai.update_required.title')}</AppText>
      <AppText variant="bodyLarge">{t('ai.update_required.explanation')}</AppText>
    </View>
  );
}
