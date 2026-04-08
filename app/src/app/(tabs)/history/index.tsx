import { HistoryContent } from '@/components/presentation/data/history-content';
import { useTranslate } from '@tolgee/react';
import { Stack } from 'expo-router';

export default function HistoryPage() {
  const { t } = useTranslate();

  return (
    <>
      <Stack.Screen
        options={{
          title: t('generic.history.title'),
        }}
      />
      <HistoryContent />
    </>
  );
}
