import { useAppTheme, spacing, font } from '@/hooks/useAppTheme';
import { Duration } from '@js-joda/core';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';

interface DurationEditorProps {
  label?: string;
  duration: Duration;
  showHours?: boolean;
  onDurationUpdated: (rest: Duration) => void;
}

export default function DurationEditor(props: DurationEditorProps) {
  const { colors } = useAppTheme();
  const { duration, onDurationUpdated } = props;

  const [hours, setHours] = useState(duration.toHours().toString());
  const [minutes, setMinutes] = useState(
    (duration.toMinutes() % 60).toString(),
  );
  const [seconds, setSeconds] = useState((duration.seconds() % 60).toString());

  const updateHours = (text: string) => {
    setHours(text);
    const hours = Number.parseInt(text);
    if (!isNaN(hours)) {
      const seconds = duration.seconds() % 60;
      const mins = duration.toMinutes();
      onDurationUpdated(
        Duration.ofSeconds(seconds + mins * 60 + hours * 60 * 60),
      );
    }
  };
  const updateMinutes = (text: string) => {
    setMinutes(text);
    const mins = Number.parseInt(text);
    if (!isNaN(mins)) {
      const seconds = duration.seconds() % 60;
      onDurationUpdated(Duration.ofSeconds(seconds + mins * 60));
    }
  };
  const updateSeconds = (text: string) => {
    setSeconds(text);
    const seconds = Number.parseInt(text);
    if (!isNaN(seconds)) {
      const mins = duration.toMinutes();
      onDurationUpdated(Duration.ofSeconds(mins * 60 + seconds));
    }
  };

  const resetValues = () => {
    setMinutes((duration.toMinutes() % 60).toString());
    setSeconds((duration.seconds() % 60).toString());
  };

  return (
    <>
      {props.label && (
        <Text
          style={{
            ...font['text-lg'],
            color: colors.onSurface,
            textAlign: 'center',
          }}
        >
          {props.label}
        </Text>
      )}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          gap: spacing[2],
        }}
      >
        {props.showHours ? (
          <>
            <TextInput
              inputMode="numeric"
              style={{ width: spacing[20], textAlign: 'center' }}
              value={hours}
              onChangeText={updateHours}
              onBlur={resetValues}
              right={<TextInput.Affix text="h" />}
            />
            <Text
              style={{
                alignSelf: 'center',
                ...font['text-xl'],
                fontWeight: 'bold',
                color: colors.onSecondaryContainer,
              }}
            />
          </>
        ) : undefined}
        <TextInput
          inputMode="numeric"
          style={{ width: spacing[20], textAlign: 'center' }}
          value={minutes}
          onChangeText={updateMinutes}
          onBlur={resetValues}
          right={<TextInput.Affix text="m" />}
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
          right={<TextInput.Affix text="s" />}
        />
      </View>
    </>
  );
}
