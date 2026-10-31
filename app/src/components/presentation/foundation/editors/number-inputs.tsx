import { useDerivedState } from '@/hooks/useDerivedState';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { TextField } from '@/components/presentation/foundation/text-field';
import {
  getDurationComponents,
  updateDurationHours,
  updateDurationMinutes,
  updateDurationSeconds,
} from '@/utils/duration-utils';
import { localeFormatBigNumber, localeParseBigNumber } from '@/utils/locale-bignumber';
import { Duration } from '@js-joda/core';
import BigNumber from 'bignumber.js';
import { createContext, useContext, useRef } from 'react';
import { Platform, type TextInput, View } from 'react-native';
import { Text } from 'react-native-paper';

/** Off inside a container that brings its own Done, so iOS does not add a second one above number pads. */
export const KeyboardDoneButtonContext = createContext(true);

export type NumberInputSize = 'regular' | 'large';

interface NumberInputProps {
  value: string;
  onChangeText: (value: string) => void;
  onBlur?: () => void;
  keyboardType: 'decimal-pad' | 'number-pad';
  accessibilityLabel: string;
  minWidth?: number;
  flex?: number;
  readOnly?: boolean;
  autoFocus?: boolean;
  size?: NumberInputSize;
  testID?: string;
}

export function NumberInput(props: NumberInputProps) {
  const keyboardDoneButton = useContext(KeyboardDoneButtonContext);
  const input = useRef<TextInput>(null);
  const selectAllOnAndroid = () => {
    if (Platform.OS === 'android' && props.value) {
      // A 50-100ms timeout bypasses Android's native keyboard-layout cursor reset
      setTimeout(() => input.current?.setSelection(0, props.value.length), 50);
    }
  };
  const large = props.size === 'large';
  return (
    <TextField
      ref={input}
      underline="always"
      font={large ? 'text-4xl' : 'text-xl'}
      testID={props.testID}
      value={props.value}
      onChangeText={props.onChangeText}
      onFocus={selectAllOnAndroid}
      onBlur={props.onBlur}
      keyboardType={props.keyboardType}
      accessibilityLabel={props.accessibilityLabel}
      readOnly={props.readOnly}
      autoFocus={props.autoFocus}
      selectTextOnFocus={Platform.OS === 'ios'}
      submitBehavior="blurAndSubmit"
      returnKeyType={keyboardDoneButton ? 'done' : undefined}
      style={{
        minWidth: props.minWidth,
        flex: props.flex,
        textAlign: 'center',
        textAlignVertical: 'center',
        paddingHorizontal: spacing[2],
        height: large ? spacing[14] : spacing[11],
        fontWeight: large ? '500' : undefined,
      }}
    />
  );
}

const formatDecimal = (value: BigNumber) => localeFormatBigNumber(value) || '0';

export function DecimalInput(props: {
  value: BigNumber;
  onChange: (value: BigNumber) => void;
  accessibilityLabel: string;
  minWidth?: number;
  flex?: number;
  autoFocus?: boolean;
  size?: NumberInputSize;
  testID?: string;
}) {
  const [text, setText] = useDerivedState(props.value, formatDecimal);
  const changeText = (next: string) => {
    const trimmed = next.trim();
    const parsed = trimmed === '' ? new BigNumber(0) : localeParseBigNumber(trimmed);
    if (parsed.isNaN()) {
      return;
    }
    setText(next);
    if (!parsed.isEqualTo(props.value)) {
      props.onChange(parsed);
    }
  };
  return (
    <NumberInput
      value={text}
      onChangeText={changeText}
      onBlur={() => setText(formatDecimal(props.value))}
      keyboardType="decimal-pad"
      accessibilityLabel={props.accessibilityLabel}
      minWidth={props.minWidth}
      flex={props.flex}
      autoFocus={props.autoFocus}
      size={props.size}
      testID={props.testID}
    />
  );
}

export function IntegerInput(props: {
  value: number;
  onChange: (value: number) => void;
  accessibilityLabel: string;
  minWidth?: number;
  flex?: number;
  readOnly?: boolean;
  autoFocus?: boolean;
  size?: NumberInputSize;
  testID?: string;
}) {
  const [text, setText] = useDerivedState(props.value, (value) => value.toString());
  const changeText = (next: string) => {
    const trimmed = next.trim();
    const parsed = trimmed === '' ? 0 : Number.parseInt(trimmed, 10);
    if (Number.isNaN(parsed)) {
      return;
    }
    setText(next);
    props.onChange(parsed);
  };
  return (
    <NumberInput
      value={text}
      onChangeText={changeText}
      onBlur={() => setText(props.value.toString())}
      keyboardType="number-pad"
      accessibilityLabel={props.accessibilityLabel}
      minWidth={props.minWidth}
      flex={props.flex}
      readOnly={props.readOnly}
      autoFocus={props.autoFocus}
      size={props.size}
      testID={props.testID}
    />
  );
}

const durationFields = [
  { key: 'hours', suffix: 'h', update: updateDurationHours },
  { key: 'minutes', suffix: 'm', update: updateDurationMinutes },
  { key: 'seconds', suffix: 's', update: updateDurationSeconds },
] as const;

export function DurationInput(props: {
  duration: Duration;
  onDurationUpdated: (duration: Duration) => void;
  showHours?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  size?: NumberInputSize;
}) {
  const { colors } = useAppTheme();
  const components = getDurationComponents(props.duration);
  const fields = props.showHours ? durationFields : durationFields.filter(({ key }) => key !== 'hours');
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing[2] }}>
      {fields.map(({ key, suffix, update }, index) => (
        <View key={key} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[1] }}>
          <IntegerInput
            testID={`duration-editor-${key}`}
            value={components[key]}
            onChange={(value) => props.onDurationUpdated(update(props.duration, value))}
            accessibilityLabel={suffix}
            minWidth={spacing[12]}
            readOnly={props.readOnly}
            autoFocus={props.autoFocus && index === 0}
            size={props.size}
          />
          <Text variant="bodyLarge" style={{ color: colors.onSurfaceVariant }}>
            {suffix}
          </Text>
        </View>
      ))}
    </View>
  );
}
