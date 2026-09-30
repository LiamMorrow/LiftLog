import { useDerivedState } from '@/hooks/useDerivedState';
import { useRef } from 'react';
import { Platform, TextStyle, TextInput as NativeTextInput } from 'react-native';
import { TextInput, TextInputProps } from 'react-native-paper';

interface IntegerEditorProps {
  value: number;
  onChange: (val: number) => void;
  noUnderline?: boolean | undefined;
  style?: TextStyle;
  testID?: string;
}

export function IntegerEditor(props: IntegerEditorProps & Partial<Omit<TextInputProps, keyof IntegerEditorProps>>) {
  const { value, onChange, noUnderline, style, testID, ...rest } = props;
  const [text, setText] = useDerivedState(value, (v) => v.toString());

  const propagateChanges = (text: string) => {
    const trimmed = text.trim();
    const parsed = trimmed === '' ? 0 : Number.parseInt(trimmed, 10);

    if (Number.isNaN(parsed)) {
      return value;
    }

    setText(text);
    onChange(parsed);
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
      inputMode={'numeric'}
      keyboardType={'numeric'}
      onChangeText={propagateChanges}
      submitBehavior="blurAndSubmit"
      returnKeyType="done"
      underlineStyle={noUnderline ? { display: 'none' } : {}}
      selectTextOnFocus={Platform.OS === 'ios'}
      style={[style]}
      // oxlint-disable-next-line typescript/no-non-null-asserted-optional-chain
      textColor={style?.color! as string}
      onBlur={() => setText(value.toString())}
      {...rest}
    />
  );
}
