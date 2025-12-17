import { useAppTheme, spacing } from '@/hooks/useAppTheme';
import { T } from '@tolgee/react';
import { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
interface LoaderProps {
  children?: ReactNode;
  loadingText?: string;
}
export function Loader(props: LoaderProps) {
  const { colors } = useAppTheme();
  return (
    <View
      style={{
        justifyContent: 'center',
        marginVertical: 'auto',
        gap: spacing[4],
      }}
    >
      <View>
        <ActivityIndicator />
      </View>
      {props.children ?? (
        <Text style={{ color: colors.onSurface, textAlign: 'center' }}>
          {props.loadingText ?? <T keyName="generic.loading.label" />}
        </Text>
      )}
    </View>
  );
}
