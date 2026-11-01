import { textVariants, TextVariant } from '@/components/presentation/foundation/app-text';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Ref, useState } from 'react';
import { Platform, TextInput, TextInputProps } from 'react-native';

export type TextFieldProps = Omit<TextInputProps, 'selectionColor' | 'selectionHandleColor' | 'cursorColor'> & {
  ref?: Ref<TextInput>;
  variant?: TextVariant;
  underline?: 'always' | 'focused';
};

export function TextField({ ref, variant = 'bodyLarge', underline, style, ...props }: TextFieldProps) {
  const { colors } = useAppTheme();
  const [focused, setFocused] = useState(false);
  const { fontSize, lineHeight } = textVariants[variant];

  return (
    <TextInput
      ref={ref}
      placeholderTextColor={colors.onSurfaceVariant + '99'}
      {...props}
      onFocus={(e) => {
        setFocused(true);
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        props.onBlur?.(e);
      }}
      selectionColor={Platform.OS === 'android' ? colors.primary + '66' : colors.primary}
      selectionHandleColor={colors.primary}
      cursorColor={colors.primary}
      style={[
        {
          fontSize,
          lineHeight: props.multiline ? lineHeight : undefined,
          minHeight: lineHeight,
          color: props.readOnly ? colors.onSurfaceVariant : colors.onSurface,
          padding: 0,
          margin: 0,
        },
        underline && {
          borderBottomWidth: 2,
          borderBottomColor: props.readOnly
            ? colors.outlineVariant
            : focused
              ? colors.primary
              : underline === 'always'
                ? colors.outline
                : 'transparent',
        },
        style,
      ]}
    />
  );
}
