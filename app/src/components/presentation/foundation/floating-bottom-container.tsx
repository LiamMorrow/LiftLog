import { spacing } from '@/hooks/useAppTheme';
import { ReactNode } from 'react';
import { View } from 'react-native';

export default function FloatingBottomContainer({ additionalContent }: { additionalContent?: ReactNode }) {
  return (
    <View
      style={{
        flex: 1,
        marginTop: 'auto',
        padding: spacing.pageHorizontalMargin,
        gap: spacing[2],
        zIndex: 10,
        pointerEvents: 'box-none',
      }}
    >
      {additionalContent}
    </View>
  );
}
