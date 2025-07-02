import { spacing } from '@/hooks/useAppTheme';
import { ReactNode } from 'react';
import { View } from 'react-native';

export default function LabelledForm(props: { children: ReactNode }) {
  return (
    <View
      style={{
        paddingHorizontal: spacing.pageHorizontalMargin,
        justifyContent: 'space-between',
        gap: spacing[4],
      }}
    >
      {props.children}
    </View>
  );
}
