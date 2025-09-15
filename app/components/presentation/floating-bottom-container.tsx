import { spacing } from '@/hooks/useAppTheme';
import { ReactNode } from 'react';
import { View } from 'react-native';

export default function FloatingBottomContainer({
  fab,
  additionalContent,
}: {
  fab?: ReactNode;
  additionalContent?: ReactNode;
}) {
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
      {fab ? (
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'flex-end',
            width: '100%',
            marginTop: spacing[2],
          }}
        >
          {fab}
        </View>
      ) : undefined}
      {additionalContent}
    </View>
  );
}
