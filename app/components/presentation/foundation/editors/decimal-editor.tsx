import {
  localeFormatBigNumber,
  localeParseBigNumber,
} from '@/utils/locale-bignumber';
import React, { useState, useEffect } from 'react';
import { TextStyle } from 'react-native';
import { TextInput } from 'react-native-paper';
import BigNumber from 'bignumber.js';

interface DecimalEditorProps {
  value: BigNumber;
  onChange: (val: BigNumber) => void;
  style?: TextStyle;
  testID?: string;
}

export function DecimalEditor(props: DecimalEditorProps) {
  const { value, onChange } = props;
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
      testID={props.testID!}
      value={text}
      inputMode={'decimal'}
      keyboardType={'decimal-pad'}
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
