import IconButton from '@/components/presentation/gesture-wrappers/icon-button';
import { useAppTheme, spacing, font } from '@/hooks/useAppTheme';
import { Text, View } from 'react-native';

interface FixedIncrementerProps<T> {
  value: T;
  label: string;
  increment: () => void;
  decrement: () => void;
  testID?: string;
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
      testID={props.testID}
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
          <IconButton
            icon={'remove'}
            onPress={props.decrement}
            testID="fixed-decrement"
          />
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
          <IconButton
            icon={'add'}
            onPress={props.increment}
            testID="fixed-increment"
          />
        </View>
      </View>
    </View>
  );
}
