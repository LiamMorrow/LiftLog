import { IntegerEditor } from '@/components/presentation/foundation/editors/integer-editor';
import IconButton from '@/components/presentation/foundation/gesture-wrappers/icon-button';
import { useAppTheme, font } from '@/hooks/useAppTheme';
import { Text, View } from 'react-native';

interface FixedIncrementerProps {
  value: number;
  label: string;
  onValueChange: (value: number) => void;
  testID?: string;
}

export default function FixedIncrementer(props: FixedIncrementerProps) {
  const { colors } = useAppTheme();

  return (
    <View testID={props.testID}>
      <Text
        style={{
          color: colors.onSurface,
          ...font['text-lg'],
          textAlign: 'center',
        }}
      >
        {props.label}
      </Text>

      <IntegerEditor
        style={{
          color: colors.primary,
          ...font['text-2xl'],
          fontWeight: 'bold',
          textAlign: 'center',
          flex: 1,
        }}
        onChange={props.onValueChange}
        value={props.value}
        testID="fixed-value-input"
      />

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <IconButton
          icon={'remove'}
          onPress={() => props.onValueChange(props.value - 1)}
          testID="fixed-decrement"
        />
        <IconButton
          icon={'add'}
          onPress={() => props.onValueChange(props.value + 1)}
          testID="fixed-increment"
        />
      </View>
    </View>
  );
}
