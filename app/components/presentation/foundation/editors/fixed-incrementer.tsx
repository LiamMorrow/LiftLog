import IconButton from '@/components/presentation/foundation/gesture-wrappers/icon-button';
import { useAppTheme, spacing, font } from '@/hooks/useAppTheme';
import { useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

interface FixedIncrementerProps<T> {
  value: T;
  label: string;
  onValueChange: (value: number) => void;
  testID?: string;
}

export default function FixedIncrementer<T extends { toString(): string }>(
  props: FixedIncrementerProps<T>,
) {
  const { colors } = useAppTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const inputRef = useRef<TextInput>(null);

  const handlePress = () => {
    setEditText(props.value?.toString() ?? '');
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSubmit = () => {
    setIsEditing(false);
    const parsed = parseInt(editText, 10);
    if (!isNaN(parsed)) {
      props.onValueChange(parsed);
    }
  };

  return (
    <View
      style={{
        justifyContent: 'center',
        flexDirection: 'row',
      }}
      testID={props.testID}
    >
      <View
        style={{
          gap: spacing[2],
        }}
      >
        <Text
          style={{
            color: colors.onSurface,
            ...font['text-lg'],
            textAlign: 'center',
          }}
        >
          {props.label}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <IconButton
            icon={'remove'}
            onPress={() => props.onValueChange(Number(props.value) - 1)}
            testID="fixed-decrement"
          />
          {isEditing ? (
            <TextInput
              ref={inputRef}
              style={{
                color: colors.primary,
                ...font['text-3xl'],
                marginHorizontal: spacing[2],
                fontWeight: 'bold',
                textAlign: 'center',
                minWidth: 40,
                padding: 0,
              }}
              value={editText}
              onChangeText={setEditText}
              keyboardType="number-pad"
              selectTextOnFocus
              onBlur={handleSubmit}
              onSubmitEditing={handleSubmit}
              testID="fixed-value-input"
            />
          ) : (
            <Pressable
              onPress={handlePress}
              testID="fixed-value-display"
            >
              <Text
                style={{
                  color: colors.primary,
                  ...font['text-3xl'],
                  marginHorizontal: spacing[2],
                  fontWeight: 'bold',
                }}
              >
                {props.value?.toString()}
              </Text>
            </Pressable>
          )}
          <IconButton
            icon={'add'}
            onPress={() => props.onValueChange(Number(props.value) + 1)}
            testID="fixed-increment"
          />
        </View>
      </View>
    </View>
  );
}
