import { useAppTheme, spacing, font } from '@/hooks/useAppTheme';
import { Duration } from '@js-joda/core';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TextInput } from 'react-native';

interface DurationEditorProps {
  duration: Duration;
  onDurationUpdated: (rest: Duration) => void;
  readonly?: boolean;
}

export default function TimerEditor(props: DurationEditorProps) {
  const { colors } = useAppTheme();
  const { duration, onDurationUpdated, readonly } = props;

  const [hours, setHours] = useState(
    duration.toHours().toString().padStart(2, '0'),
  );
  const [minutes, setMinutes] = useState(
    (duration.toMinutes() % 60).toString().padStart(2, '0'),
  );
  const [seconds, setSeconds] = useState(
    (duration.seconds() % 60).toString().padStart(2, '0'),
  );

  const updateHours = (text: string) => {
    setHours(text);
    const hours = Number.parseInt(text);
    if (!isNaN(hours)) {
      const seconds = duration.seconds() % 60;
      const mins = duration.toMinutes() % 60;
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

  const resetValues = useCallback(() => {
    setHours(duration.toHours().toString().padStart(2, '0'));
    setMinutes((duration.toMinutes() % 60).toString().padStart(2, '0'));
    setSeconds((duration.seconds() % 60).toString().padStart(2, '0'));
  }, [duration]);
  useEffect(() => {
    if (readonly) {
      resetValues();
    }
  }, [readonly, resetValues]);
  const fontProps = StyleSheet.create({
    textInput: {
      fontVariant: ['tabular-nums'],
      textAlign: 'center',
      textAlignVertical: 'center',
      ...font['text-xl'],
      maxWidth: 60, // unsure why but this is required in web otherwise the inputs stretch
      color: colors.onSecondaryContainer,
    },
    separator: {
      fontWeight: 'bold',
    },
  });
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: spacing[2],
        alignItems: 'center',
      }}
    >
      <TextInput
        inputMode="numeric"
        testID="timer-editor-hours"
        readOnly={readonly}
        selectTextOnFocus
        style={fontProps.textInput}
        value={hours}
        onChangeText={updateHours}
        onBlur={resetValues}
      />
      <Text style={[fontProps.textInput, fontProps.separator]}>:</Text>
      <TextInput
        inputMode="numeric"
        testID="timer-editor-minutes"
        selectTextOnFocus
        style={fontProps.textInput}
        value={minutes}
        readOnly={readonly}
        onChangeText={updateMinutes}
        onBlur={resetValues}
      />
      <Text style={[fontProps.textInput, fontProps.separator]}>:</Text>
      <TextInput
        inputMode="numeric"
        testID="timer-editor-seconds"
        selectTextOnFocus
        style={fontProps.textInput}
        value={seconds}
        readOnly={readonly}
        onChangeText={updateSeconds}
        onBlur={resetValues}
      />
    </View>
  );
}
