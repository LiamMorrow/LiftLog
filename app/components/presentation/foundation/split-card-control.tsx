import { spacing } from '@/hooks/useAppTheme';
import { ReactNode } from 'react';
import { View } from 'react-native';

interface SplitCardControlProps {
  titleContent: ReactNode;
  mainContent: ReactNode;
  actions?: ReactNode;
}

export default function SplitCardControl(props: SplitCardControlProps) {
  return (
    <View style={{ gap: spacing[2] }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: spacing[4],
        }}
      >
        {props.titleContent}
        <View
          style={{
            flexDirection: 'row',
            marginLeft: spacing[2],
            alignItems: 'flex-start',
            marginTop: -spacing[2],
            marginRight: -spacing[2],
          }}
        >
          {props.actions}
        </View>
      </View>
      <View style={{ paddingRight: spacing[2], flex: 1 }}>
        {props.mainContent}
      </View>
    </View>
  );
}
