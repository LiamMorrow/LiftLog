import { TitledSection } from '@/components/presentation/stats/titled-section';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { ReactNode } from 'react';
import { Card } from 'react-native-paper';

export function StatCardWithTitle(props: { title: string; children: ReactNode }) {
  const { colors } = useAppTheme();
  return (
    <TitledSection title={props.title}>
      <Card
        mode="contained"
        style={{
          backgroundColor: colors.surfaceContainer,
        }}
      >
        <Card.Content style={{ paddingVertical: spacing[8] }}>{props.children}</Card.Content>
      </Card>
    </TitledSection>
  );
}
