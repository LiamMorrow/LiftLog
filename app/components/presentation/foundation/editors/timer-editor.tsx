import { useAppTheme, spacing, font } from '@/hooks/useAppTheme';
import {
  getDurationComponents,
  updateDurationHours,
  updateDurationMinutes,
  updateDurationSeconds,
} from '@/utils/duration-utils';
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

  const formatComponent = (value: number) => value.toString().padStart(2, '0');
  const initialComponents = getDurationComponents(duration);

  const [hours, setHours] = useState(formatComponent(initialComponents.hours));
  const [minutes, setMinutes] = useState(
    formatComponent(initialComponents.minutes),
  );
  const [seconds, setSeconds] = useState(
    formatComponent(initialComponents.seconds),
  );

  const updateHours = (text: string) => {
    setHours(text);
    const newHours = Number.parseInt(text);
    if (!isNaN(newHours)) {
      onDurationUpdated(updateDurationHours(duration, newHours));
    }
  };
  const updateMinutes = (text: string) => {
    setMinutes(text);
    const newMins = Number.parseInt(text);
    if (!isNaN(newMins)) {
      onDurationUpdated(updateDurationMinutes(duration, newMins));
    }
  };
  const updateSeconds = (text: string) => {
    setSeconds(text);
    const newSeconds = Number.parseInt(text);
    if (!isNaN(newSeconds)) {
      onDurationUpdated(updateDurationSeconds(duration, newSeconds));
    }
  };

  const resetValues = useCallback((duration: Duration) => {
    const components = getDurationComponents(duration);
    setHours(formatComponent(components.hours));
    setMinutes(formatComponent(components.minutes));
    setSeconds(formatComponent(components.seconds));
  }, []);
  useEffect(() => {
    if (readonly) {
      resetValues(duration);
    }
  }, [readonly, resetValues, duration]);
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
        onBlur={() => resetValues(duration)}
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
        onBlur={() => resetValues(duration)}
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
        onBlur={() => resetValues(duration)}
      />
    </View>
  );
}
