import { DatePickerProps } from './date-picker-props';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useFormatDate } from '@/hooks/useFormatDate';
import { fromComposeDate } from '@/utils/compose-date';
import { DatePickerDialog, Host, Text, TextButton } from '@expo/ui/jetpack-compose';
import { testID as testIDModifier } from '@expo/ui/jetpack-compose/modifiers';
import { useTranslate } from '@tolgee/react';
import { useState } from 'react';

export function DatePicker({ value, onChange, testID }: DatePickerProps) {
  const { colors } = useAppTheme();
  const { t } = useTranslate();
  const formatDate = useFormatDate();
  const [open, setOpen] = useState(false);

  return (
    <Host matchContents seedColor={colors.seedColor} colorScheme={colors.scheme}>
      <TextButton onClick={() => setOpen(true)} modifiers={testID ? [testIDModifier(testID)] : []}>
        <Text>{formatDate(value, { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
      </TextButton>
      {open && (
        <DatePickerDialog
          initialDate={value.toString()}
          confirmButtonLabel={t('generic.ok.button')}
          dismissButtonLabel={t('generic.cancel.button')}
          onDateSelected={(date) => {
            setOpen(false);
            onChange(fromComposeDate(date));
          }}
          onDismissRequest={() => setOpen(false)}
        />
      )}
    </Host>
  );
}
