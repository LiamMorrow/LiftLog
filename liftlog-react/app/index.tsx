import PotentialSetCounter from '@/components/presentation/potential-set-counter';
import { useBaseThemeset } from '@/hooks/useBaseThemeset';
import { View } from 'react-native';

export default function Index() {
  const style = useBaseThemeset();
  return (
    <View
      style={style}
      className="flex-1 items-center justify-center gap-y-2 text-center"
    >
      <View className="items-center">
        <PotentialSetCounter />
      </View>
    </View>
  );
}
