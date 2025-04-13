import { Loader } from '@/components/presentation/loader';
import { RemoteData } from '@/models/remote';
import { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { Button, Icon } from 'react-native-paper';

interface RemoteProps<T> {
  value: RemoteData<T>;
  retry?: () => void;
  success: (value: T) => ReactNode;
  loading?: () => ReactNode;
  notAsked?: () => ReactNode;
  error?: (err: unknown) => ReactNode;
}
export function Remote<T>(props: RemoteProps<T>) {
  let { success, error, loading, notAsked, retry } = props;
  loading ??= () => <Loader />;
  notAsked ??= loading;
  error ??= (value) => (
    <View>
      <Icon source={'error'} size={30} />
      <View>
        <Text>{typeof value === 'string' ? value : 'Unknown error'}</Text>
        {retry ? <Button onPress={retry}>Retry</Button> : undefined}
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
