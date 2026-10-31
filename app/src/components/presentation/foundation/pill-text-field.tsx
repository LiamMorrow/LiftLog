import { TextField, TextFieldProps } from '@/components/presentation/foundation/text-field';
import { font, spacing, useAppTheme } from '@/hooks/useAppTheme';
import { ReactNode, useRef } from 'react';
import { Pressable, StyleProp, type TextInput, View, ViewStyle } from 'react-native';

export const pillTextFieldHeight = spacing[14];

type PillTextFieldProps = Omit<TextFieldProps, 'ref' | 'style' | 'font' | 'underline'> & {
  leading?: ReactNode;
  trailing?: ReactNode;
  /** How far a multiline field grows before it scrolls. */
  maxLines?: number;
  style?: StyleProp<ViewStyle>;
};

export function PillTextField({ leading, trailing, maxLines = 6, style, ...props }: PillTextFieldProps) {
  const { colors } = useAppTheme();
  const input = useRef<TextInput>(null);
  const verticalPadding = (pillTextFieldHeight - font['text-base'].lineHeight) / 2;

  return (
    <Pressable
      onPress={() => input.current?.focus()}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: spacing[3],
          paddingLeft: leading ? spacing[4] : spacing[5],
          paddingRight: trailing ? spacing[1] : spacing[5],
          borderRadius: pillTextFieldHeight / 2,
          backgroundColor: colors.surfaceContainerHigh,
        },
        style,
      ]}
    >
      {leading ? <View style={{ height: pillTextFieldHeight, justifyContent: 'center' }}>{leading}</View> : undefined}
      <TextField
        ref={input}
        {...props}
        style={{
          flex: 1,
          paddingVertical: verticalPadding,
          maxHeight: props.multiline ? font['text-base'].lineHeight * maxLines + verticalPadding * 2 : undefined,
        }}
      />
      {trailing ? <View style={{ height: pillTextFieldHeight, justifyContent: 'center' }}>{trailing}</View> : undefined}
    </Pressable>
  );
}
