import Holdable from '@/components/presentation/foundation/holdable';
import { spacing } from '@/hooks/useAppTheme';
import { ReactNode } from 'react';
import { Card } from 'react-native-paper';

export function CardioTrackerCard(props: { onHold: () => void; children: ReactNode }) {
  return (
    <Holdable onLongPress={props.onHold} style={{ alignSelf: 'stretch' }}>
      <Card
        mode="contained"
        container={false} // needed to allow container to grow to fit stretched card
        style={{ flex: 1 }}
        contentStyle={{ flex: 1 }}
      >
        <Card.Content
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing[2],
            flex: 1,
          }}
        >
          {props.children}
        </Card.Content>
      </Card>
    </Holdable>
  );
}
