import ItemTitle from '@/components/presentation/item-title';
import { useAppTheme, spacing, font } from '@/hooks/useAppTheme';
import { View } from 'react-native';

export default function ListTitle(props: { title: string }) {
  const { colors } = useAppTheme();
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
