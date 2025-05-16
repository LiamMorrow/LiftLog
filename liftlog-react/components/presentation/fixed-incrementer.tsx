import { useAppTheme, spacing, font } from '@/hooks/useAppTheme';
import { Text, View } from 'react-native';
import { IconButton } from 'react-native-paper';

interface FixedIncrementerProps<T> {
  value: T;
  label: string;
  increment: () => void;
  decrement: () => void;
}

export default function FixedIncrementer<T extends { toString(): string }>(
  props: FixedIncrementerProps<T>,
) {
  const { colors } = useAppTheme();
  return (
    <View
      style={{
        justifyContent: 'center',
        flexDirection: 'row',
      }}
    >
      <View
        style={{
          gap: spacing[2],
        }}
      >
        <Text
          style={{
            color: colors.onSurface,
            ...font['text-lg'],
            textAlign: 'center',
          }}
        >
          {props.label}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <IconButton icon={msIconSource('remove')} onPress={props.decrement} />
          <Text
            style={{
              color: colors.primary,
              ...font['text-3xl'],
              marginHorizontal: spacing[2],
              fontWeight: 'bold',
            }}
          >
            {props.value?.toString()}
          </Text>
          <IconButton icon={msIconSource('add')} onPress={props.increment} />
        </View>
      </View>
    </View>
  );
}
