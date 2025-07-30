import { SurfaceText } from '@/components/presentation/surface-text';
import { spacing } from '@/hooks/useAppTheme';
import { ReactNode } from 'react';
import { Card } from 'react-native-paper';

export default function SingleValueStatisticCard(props: {
  children: ReactNode;
  title: string;
}) {
  return (
    <Card mode="contained" style={{ flex: 1 }}>
      <Card.Content
        style={{
          gap: spacing[1],
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}
      >
        {props.children}
        <SurfaceText style={{ textAlign: 'center' }} font="text-sm">
          {props.title}
        </SurfaceText>
      </Card.Content>
    </Card>
  );
}
