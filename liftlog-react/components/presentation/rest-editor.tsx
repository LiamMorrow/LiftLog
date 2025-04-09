import { useAppTheme } from '@/hooks/useAppTheme';
import { Duration } from '@js-joda/core';
import { Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';

interface RestEditorProps {
  label: string;
  rest: Duration;
  onRestUpdated: (rest: Duration) => void;
}

export default function RestEditor(props: RestEditorProps) {
  const { font, colors, spacing } = useAppTheme();
  return (
    <>
      <Text
        style={{
          ...font['text-lg'],
          color: colors.onSurface,
          textAlign: 'center',
        }}
      >
        {props.label}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          gap: spacing[2],
        }}
      >
        <TextInput
          inputMode="numeric"
          style={{ width: spacing[20], textAlign: 'center' }}
          value={props.rest.toMinutes().toString()}
        />
        <Text
          style={{
            alignSelf: 'center',
            ...font['text-xl'],
            fontWeight: 'bold',
            color: colors.onSecondaryContainer,
          }}
        >
          :
        </Text>
        <TextInput
          inputMode="numeric"
          style={{ width: spacing[20], textAlign: 'center' }}
          value={(props.rest.seconds() % 60).toString()}
        />
      </View>
    </>
  );
}
