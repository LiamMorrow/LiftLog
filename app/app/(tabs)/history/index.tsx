import { spacing } from '@/hooks/useAppTheme';
import { useTranslate } from '@tolgee/react';
import { Stack } from 'expo-router';
import { HistoryContent } from '@/components/presentation/data/history-content';

export default function HistoryPage() {
  const { t } = useTranslate();

  return (
    <>
      <Stack.Screen
        options={{
          title: t('generic.history.title'),
        }}
      />
      <HistoryContent
        contentContainerStyle={{
          gap: spacing[4],
          paddingHorizontal: spacing.pageHorizontalMargin,
        }}
      />
    </>
  );
}
