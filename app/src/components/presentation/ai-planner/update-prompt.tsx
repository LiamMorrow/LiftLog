import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { spacing } from '@/hooks/useAppTheme';
import { useTranslate } from '@tolgee/react';
import { View } from 'react-native';

export function UpdatePrompt() {
  const { t } = useTranslate();
  return (
    <View style={{ gap: spacing[2] }}>
      <SurfaceText weight="bold">{t('ai.update_required.title')}</SurfaceText>
      <SurfaceText>{t('ai.update_required.explanation')}</SurfaceText>
    </View>
  );
}
