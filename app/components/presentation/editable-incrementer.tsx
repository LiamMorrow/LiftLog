import { SurfaceText } from '@/components/presentation/surface-text';
import { spacing } from '@/hooks/useAppTheme';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { IconButton, List, TextInput } from 'react-native-paper';

interface EditableIncrementerProps {
  increment: BigNumber;
  label: string;
  value: BigNumber;
  suffix: string;
  onChange: (val: BigNumber) => void;
}

export default function EditableIncrementer(props: EditableIncrementerProps) {
  const { increment, label, value, onChange } = props;
  const [text, setText] = useState(props.value.toFormat());
  const [editorValue, setEditorValue] = useState<BigNumber>(value);

  const handleTextChange = (text: string) => {
    setText(text);
    if (text.trim() === '') {
      setEditorValue(new BigNumber('0'));
      return;
    }

    const parsed = BigNumber(text);
    if (!parsed.isNaN()) {
      setEditorValue(parsed);
      return;
    }
  };
  useEffect(() => {
    setText(value?.toFormat() ?? '');
    setEditorValue(value);
  }, [value]);

  return (
    <List.Item
      title={label}
      titleNumberOfLines={2}
      right={() => (
        <>
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            <IconButton
              icon={'remove'}
              onPress={() => {
                onChange(editorValue.minus(increment));
              }}
            />
            <TextInput
              data-cy="editable-field"
              value={text}
              inputMode="decimal"
              onChangeText={handleTextChange}
              selectTextOnFocus
              onBlur={() => onChange(editorValue)}
              right={<TextInput.Affix text={props.suffix} />}
            />
            <IconButton
              icon={'add'}
              onPress={() => onChange(editorValue.plus(increment))}
            />
          </View>
        </>
      )}
    ></List.Item>
  );
}
