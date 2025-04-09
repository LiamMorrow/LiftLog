import { useAppTheme } from '@/hooks/useAppTheme';
import { Duration } from '@js-joda/core';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';

interface RestEditorProps {
  label: string;
  rest: Duration;
  onRestUpdated: (rest: Duration) => void;
}

export default function RestEditor(props: RestEditorProps) {
  const { font, colors, spacing } = useAppTheme();
  const { rest, onRestUpdated } = props;

  const [minutes, setMinutes] = useState(rest.toMinutes().toString());
  const [seconds, setSeconds] = useState((rest.seconds() % 60).toString());

  const updateMinutes = (text: string) => {
    setMinutes(text);
    const mins = Number.parseInt(text);
    if (!isNaN(mins)) {
      const seconds = rest.seconds() % 60;
      onRestUpdated(Duration.ofSeconds(seconds + mins * 60));
    }
  };
  const updateSeconds = (text: string) => {
    setSeconds(text);
    const seconds = Number.parseInt(text);
    if (!isNaN(seconds)) {
      const mins = rest.toMinutes();
      onRestUpdated(Duration.ofSeconds(mins * 60 + seconds));
    }
  };

  const resetValues = () => {
    setMinutes(rest.toMinutes().toString());
    setSeconds((rest.seconds() % 60).toString());
  };

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
          value={minutes}
          onChangeText={updateMinutes}
          onBlur={resetValues}
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
          value={seconds}
          onChangeText={updateSeconds}
          onBlur={resetValues}
        />
      </View>
    </>
  );
}
