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
    <View>
      <Text
        style={{
          color: colors.onSurface,
          ...font['text-lg'],
          textAlign: 'center',
        }}
      >
        {props.label}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'center',
        }}
      >
        <IconButton
          icon={'remove'}
          onPress={() => props.onValueChange(Number(props.value) - 1)}
          testID="fixed-decrement"
        />
        <IntegerEditor
          style={{
            color: colors.primary,
            ...font['text-3xl'],
            fontWeight: 'bold',
            textAlign: 'center',
            minWidth: 40,
          }}
          onChange={props.onValueChange}
          value={props.value}
          testID="fixed-value-input"
        />
        <IconButton
          icon={'add'}
          onPress={() => props.onValueChange(Number(props.value) + 1)}
          testID="fixed-increment"
        />
      </View>
    </View>
  );
}
