import { TextField, TextFieldProps } from '@/components/presentation/foundation/text-field';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { ReactNode, useRef } from 'react';
import { Pressable, type TextInput, View } from 'react-native';
import { Text } from 'react-native-paper';

type SegmentedListTextInputProps = Omit<TextFieldProps, 'ref' | 'style' | 'font' | 'underline'> & {
  label: string;
  supportingText?: string | undefined;
  error?: boolean;
  trailing?: ReactNode;
};

export function SegmentedListTextInput({
  label,
  supportingText,
  error,
  trailing,
  ...props
}: SegmentedListTextInputProps) {
  const { colors } = useAppTheme();
  const input = useRef<TextInput>(null);
  const accentColor = error ? colors.error : colors.onSurfaceVariant;
  return (
    <Pressable
      onPress={() => input.current?.focus()}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
        paddingLeft: spacing[4],
        paddingRight: trailing ? spacing[1] : spacing[4],
        paddingVertical: spacing[3],
      }}
    >
      <View style={{ flex: 1, gap: spacing[0.5] }}>
        <Text variant="labelMedium" style={{ color: accentColor }}>
          {label}
        </Text>
        <TextField
          ref={input}
          underline="focused"
          accessibilityLabel={label}
          textAlignVertical="top"
          style={{ paddingBottom: spacing[1] }}
          {...props}
        />
        {supportingText ? (
          <Text variant="bodySmall" style={{ color: accentColor }}>
            {supportingText}
          </Text>
        ) : undefined}
      </View>
      {trailing}
    </Pressable>
  );
}
