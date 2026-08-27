import React, { useState, useEffect } from 'react';
import { TextStyle } from 'react-native';
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
  const [text, setText] = useState(props.value.toString());
  const [editorValue, setEditorValue] = useState(value);

  const handleTextChange = (text: string) => {
    setText(text);
    if (text.trim() === '') {
      setEditorValue(0);
      onChange(0);
      return;
    }

    const parsed = Number.parseInt(text);
    if (!Number.isNaN(parsed)) {
      setEditorValue(parsed);
      onChange(parsed);
      return;
    }
  };
  useEffect(() => {
    if (editorValue !== value) {
      setText(value.toString() || '0');
      setEditorValue(value);
    }
  }, [value, editorValue]);
  return (
    <TextInput
      testID={testID}
      value={text}
      inputMode={'numeric'}
      keyboardType={'numeric'}
      onChangeText={handleTextChange}
      underlineStyle={noUnderline ? { display: 'none' } : {}}
      selectTextOnFocus
      style={[style]}
      // oxlint-disable-next-line typescript/no-non-null-asserted-optional-chain
      textColor={style?.color! as string}
      onBlur={() => {
        if (text === '') {
          setText('0');
        }
        onChange(editorValue);
      }}
      {...rest}
    />
  );
}
