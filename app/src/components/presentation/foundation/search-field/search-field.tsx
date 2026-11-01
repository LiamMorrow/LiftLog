import { NativeIcon } from '@/components/presentation/foundation/native-icon';
import SearchIcon from '@expo/material-symbols/search.xml';
import { NativeIconButton } from '@/components/presentation/foundation/native-icon-button';
import CloseIcon from '@expo/material-symbols/close.xml';
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
      leading={<NativeIcon icon={SearchIcon} systemImage="magnifyingglass" size={24} color={colors.onSurfaceVariant} />}
      trailing={
        value ? (
          <NativeIconButton
            icon={CloseIcon}
            systemImage="xmark"
            label={t('generic.clear.button')}
            onPress={() => onChangeText('')}
          />
        ) : undefined
      }
    />
  );
}
