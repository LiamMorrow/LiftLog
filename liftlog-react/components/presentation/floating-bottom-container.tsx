import { useAppTheme } from '@/hooks/useAppTheme';
import { ReactNode } from 'react';
import { View } from 'react-native';

export default function FloatingBottomContainer({
  fab,
  additionalContent,
}: {
  fab?: ReactNode;
  additionalContent?: ReactNode;
}) {
  const { spacing } = useAppTheme();
  return (
    <View
      style={{
        flex: 1,
        pointerEvents: 'none',
        marginTop: 'auto',
        padding: spacing[2],
        gap: spacing[2],
        zIndex: 10,
      }}
    >
      {fab && (
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
      )}
      {additionalContent && additionalContent}
    </View>
  );
}
