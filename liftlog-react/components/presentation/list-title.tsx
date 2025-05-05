import ItemTitle from '@/components/presentation/item-title';
import { spacing } from '@/hooks/useAppTheme';
import { View } from 'react-native';

export default function ListTitle(props: { title: string }) {
  return (
    <View
      style={{
        marginLeft: spacing[6],
      }}
    >
      <ItemTitle title={props.title} />
    </View>
  );
}
