import { localeFormatBigNumber, localeParseBigNumber } from '@/utils/locale-bignumber';
import { Platform, TextStyle, TextInput as NativeTextInput } from 'react-native';
import { TextInput, TextInputProps } from 'react-native-paper';
import BigNumber from 'bignumber.js';
import { useDerivedState } from '@/hooks/useDerivedState';
import { useRef } from 'react';

interface DecimalEditorProps {
  value: BigNumber;
  onChange: (val: BigNumber) => void;
  label?: string;
  style?: TextStyle;
  testID?: string;
}

const format = (v: BigNumber) => localeFormatBigNumber(v) || '0';

export function DecimalEditor(props: DecimalEditorProps & Partial<Omit<TextInputProps, keyof DecimalEditorProps>>) {
  const { value, onChange, testID, label, style, ...rest } = props;
  const [text, setText] = useDerivedState(value, format);

  const propagateChanges = (text: string) => {
    const trimmed = text.trim();
    const parsed = trimmed === '' ? new BigNumber(0) : localeParseBigNumber(trimmed);

    if (parsed.isNaN()) {
      return value;
    }

    if (!parsed.isEqualTo(value)) onChange(parsed);
    setText(text);
    return parsed;
  };

  const inputRef = useRef<NativeTextInput | null>(null);
  const selectTextOnFocus = () => {
    if (Platform.OS === 'android' && text) {
      // A 50-100ms timeout bypasses Android's native keyboard-layout cursor reset
      setTimeout(() => {
        inputRef.current?.setSelection(0, text.length);
      }, 50);
    }
  };

  return (
    <TextInput
      ref={inputRef}
      onFocus={selectTextOnFocus}
      testID={testID}
      value={text}
      inputMode={'decimal'}
      label={label}
      keyboardType={'decimal-pad'}
      onChangeText={propagateChanges}
      submitBehavior="blurAndSubmit"
      returnKeyType="done"
      selectTextOnFocus={Platform.OS === 'ios'}
      style={[style]}
      onBlur={() => setText(format(value))}
      {...rest}
    />
  );
}
