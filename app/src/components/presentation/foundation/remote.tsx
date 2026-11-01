import { Loader } from '@/components/presentation/foundation/loader';
import { AppText } from '@/components/presentation/foundation/app-text';
import { spacing } from '@/hooks/useAppTheme';
import { RemoteData } from '@/models/remote';
import { ReactNode } from 'react';
import { View } from 'react-native';
import { Icon } from '@/components/presentation/foundation/icon';
import { NativeButton } from '@/components/presentation/foundation/native-button';

interface RemoteProps<T> {
  value: RemoteData<T>;
  retry?: () => void;
  success: (value: T) => ReactNode;
  loading?: () => ReactNode;
  notAsked?: () => ReactNode;
  error?: (err: unknown) => ReactNode;
}
export function Remote<T>(props: RemoteProps<T>) {
  const { success, retry } = props;
  let { error, loading, notAsked } = props;
  loading ??= () => <Loader />;
  notAsked ??= loading;
  error ??= (value) => (
    <View style={{ alignItems: 'center', gap: spacing[4] }}>
      <Icon source={'error'} size={30} />
      <View style={{ justifyContent: 'center' }}>
        <AppText variant="bodyLarge" style={{ textAlign: 'center' }}>
          {typeof value === 'string' ? value : 'Unknown error'}
        </AppText>
        {retry ? <NativeButton variant="text" label="Retry" onPress={retry} /> : undefined}
      </View>
    </View>
  );
  return props.value.match({
    notAsked,
    loading,
    error,
    success,
  });
}
