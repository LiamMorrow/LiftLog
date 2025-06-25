import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import { spacing } from '@/hooks/useAppTheme';
import { useTranslate } from '@tolgee/react';
import { Stack } from 'expo-router';
import { LineGraph } from 'react-native-graph';
import { Card } from 'react-native-paper';

export default function StatsPage() {
  const { t } = useTranslate();
  return (
    <>
      <Stack.Screen
        options={{
          title: t('Statistics'),
        }}
      />
      <FullHeightScrollView contentContainerStyle={{ gap: spacing[4] }}>
        <Card>
          <Card.Content style={{ height: 300 }}>
            <LineGraph
              points={[
                {
                  date: new Date('2025-05-10T10:00:00Z'),
                  value: 10,
                },
                {
                  date: new Date('2025-05-11T10:00:00Z'),
                  value: 11,
                },
                {
                  date: new Date('2025-05-12T10:00:00Z'),
                  value: 11,
                },
              ]}
              style={{ flex: 1 }}
              color="#4484B2"
              animated={true}
              enablePanGesture={true}
              onGestureStart={() => {}}
              onPointSelected={(p) => {}}
              onGestureEnd={() => {}}
            />
          </Card.Content>
        </Card>
      </FullHeightScrollView>
    </>
  );
}
