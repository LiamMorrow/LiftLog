import Icon from '@/components/presentation/foundation/icon';
import IconButton from '@/components/presentation/foundation/icon-button';
import { PillTextField } from '@/components/presentation/foundation/pill-text-field';
import { TextFieldProps } from '@/components/presentation/foundation/text-field';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useTranslate } from '@tolgee/react';
import { StyleProp, ViewStyle } from 'react-native';

type SearchFieldProps = Omit<TextFieldProps, 'ref' | 'style' | 'font' | 'underline' | 'value' | 'onChangeText'> & {
  value: string;
  onChangeText: (value: string) => void;
  style?: StyleProp<ViewStyle>;
};

export function SearchField({ value, onChangeText, ...props }: SearchFieldProps) {
  const { colors } = useAppTheme();
  const { t } = useTranslate();

  return (
    <PillTextField
      placeholder={t('generic.search.button')}
      accessibilityLabel={t('generic.search.button')}
      returnKeyType="search"
      {...props}
      value={value}
      onChangeText={onChangeText}
      leading={<Icon source="search" size={24} color={colors.onSurfaceVariant} />}
      trailing={
        value ? (
          <IconButton icon="close" accessibilityLabel={t('generic.clear.button')} onPress={() => onChangeText('')} />
        ) : undefined
      }
    />
  );
}
