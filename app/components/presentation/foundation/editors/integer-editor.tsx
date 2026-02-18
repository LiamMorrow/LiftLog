import React, { useState, useEffect } from 'react';
import { TextStyle } from 'react-native';
import { TextInput } from 'react-native-paper';

interface IntegerEditorProps {
  value: number;
  onChange: (val: number) => void;
  style?: TextStyle;
  testID?: string;
}

export function IntegerEditor(props: IntegerEditorProps) {
  const { value, onChange } = props;
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
      testID={props.testID!}
      value={text}
      inputMode={'numeric'}
      keyboardType={'numeric'}
      onChangeText={handleTextChange}
      selectTextOnFocus
      style={[props.style]}
      onBlur={() => {
        if (text === '') {
          setText('0');
        }
        onChange(editorValue);
      }}
    />
  );
}
