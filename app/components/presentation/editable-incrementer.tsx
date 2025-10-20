import {
  localeFormatBigNumber,
  localeParseBigNumber,
} from '@/utils/locale-bignumber';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { TextInput } from 'react-native-paper';

interface EditableIncrementerProps {
  value: BigNumber;
  suffix?: string;
  onChange: (val: BigNumber) => void;
  disallowNegative?: boolean;
  testID?: string;
}

export default function EditableIncrementer(props: EditableIncrementerProps) {
  const { value, onChange } = props;
  const [text, setText] = useState(localeFormatBigNumber(props.value));
  const [editorValue, setEditorValue] = useState<BigNumber>(value);

  const handleTextChange = (text: string) => {
    setText(text);
    if (text.trim() === '') {
      setEditorValue(new BigNumber('0'));
      onChange(BigNumber(0));
      return;
    }

    const parsed = localeParseBigNumber(text);
    if (!parsed.isNaN() && (!props.disallowNegative || parsed.gte(0))) {
      setEditorValue(parsed);
      onChange(parsed);
      return;
    }
  };
  useEffect(() => {
    if (!editorValue.eq(value)) {
      setText(localeFormatBigNumber(value));
      setEditorValue(value);
    }
  }, [value, editorValue]);

  return (
    <View
      style={{
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
      }}
    >
      <TextInput
        testID={props.testID!}
        mode="outlined"
        value={text}
        style={{ flex: 1 }}
        inputMode={'decimal'}
        keyboardType={'decimal-pad'}
        onChangeText={handleTextChange}
        onBlur={() => {
          if (text === '') {
            setText('0');
          }
          onChange(editorValue);
        }}
        left={
          !props.disallowNegative && (
            <TextInput.Icon
              icon={'plusMinus'}
              onPress={() => {
                onChange(editorValue.multipliedBy(-1));
                setText(localeFormatBigNumber(editorValue.multipliedBy(-1)));
                setEditorValue(editorValue.multipliedBy(-1));
              }}
            />
          )
        }
        right={props.suffix && <TextInput.Affix text={props.suffix} />}
      />
    </View>
  );
}
