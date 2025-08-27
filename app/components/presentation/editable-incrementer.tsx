import {
  localeFormatBigNumber,
  localeParseBigNumber,
} from '@/utils/locale-bignumber';
import { useTranslate } from '@tolgee/react';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { IconButton, List, TextInput, Tooltip } from 'react-native-paper';

interface EditableIncrementerProps {
  label: string;
  value: BigNumber;
  suffix: string;
  onChange: (val: BigNumber) => void;
  testID?: string;
}

export default function EditableIncrementer(props: EditableIncrementerProps) {
  const { label, value, onChange } = props;
  const { t } = useTranslate();
  const [text, setText] = useState(localeFormatBigNumber(props.value));
  const [editorValue, setEditorValue] = useState<BigNumber>(value);

  const handleTextChange = (text: string) => {
    setText(text);
    if (text.trim() === '') {
      setEditorValue(new BigNumber('0'));
      return;
    }

    const parsed = localeParseBigNumber(text);
    if (!parsed.isNaN()) {
      setEditorValue(parsed);
      return;
    }
  };
  useEffect(() => {
    setText(localeFormatBigNumber(value));
    setEditorValue(value);
  }, [value]);

  return (
    <List.Item
      testID={props.testID!}
      title={label}
      titleNumberOfLines={2}
      right={() => (
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
          }}
        >
          <Tooltip title={t('Toggle negative')}>
            <IconButton
              icon={'plusMinus'}
              onPress={() => {
                onChange(editorValue.multipliedBy(-1));
              }}
            />
          </Tooltip>
          <TextInput
            testID="editable-field"
            value={text}
            inputMode="decimal"
            keyboardType="decimal-pad"
            onChangeText={handleTextChange}
            onBlur={() => onChange(editorValue)}
            right={<TextInput.Affix text={props.suffix} />}
          />
        </View>
      )}
    ></List.Item>
  );
}
