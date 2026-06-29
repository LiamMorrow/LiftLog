import { localeFormatBigNumber, localeParseBigNumber } from '@/utils/locale-bignumber';
import React, { useState, useEffect } from 'react';
import { TextStyle } from 'react-native';
import { TextInput, TextInputProps } from 'react-native-paper';
import BigNumber from 'bignumber.js';

interface DecimalEditorProps {
  value: BigNumber;
  onChange: (val: BigNumber) => void;
  label?: string;
  style?: TextStyle;
  testID?: string;
}

export function DecimalEditor(props: DecimalEditorProps & Partial<Omit<TextInputProps, keyof DecimalEditorProps>>) {
  const { value, onChange, testID, label, style, ...rest } = props;
  const [text, setText] = useState(localeFormatBigNumber(props.value) || '-');
  const [editorValue, setEditorValue] = useState(value);

  const handleTextChange = (text: string) => {
    setText(text);
    if (text.trim() === '') {
      setEditorValue(BigNumber(0));
      onChange(BigNumber(0));
      return;
    }

    const parsed = localeParseBigNumber(text);
    if (!parsed.isNaN()) {
      setEditorValue(parsed);
      onChange(parsed);
      return;
    }
  };
  useEffect(() => {
    if (!editorValue.eq(value)) {
      setText(localeFormatBigNumber(value) || '0');
      setEditorValue(value);
    }
  }, [value, editorValue]);
  return (
    <TextInput
      testID={testID}
      value={text}
      inputMode={'decimal'}
      label={label}
      keyboardType={'decimal-pad'}
      onChangeText={handleTextChange}
      submitBehavior="blurAndSubmit"
      returnKeyType="done"
      selectTextOnFocus
      style={[style]}
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
