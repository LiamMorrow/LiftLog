import { DateRangePickerProps } from './date-range-picker-props';
import { useAppTheme } from '@/hooks/useAppTheme';
import { fromComposeDate } from '@/utils/compose-date';
import { DateRangePickerDialog, Host } from '@expo/ui/jetpack-compose';
import { useTranslate } from '@tolgee/react';

export function DateRangePicker({ visible, value, onConfirm, onDismiss }: DateRangePickerProps) {
  const { colors } = useAppTheme();
  const { t } = useTranslate();
  if (!visible) {
    return null;
  }

  return (
    <Host matchContents style={{ position: 'absolute' }} seedColor={colors.seedColor} colorScheme={colors.scheme}>
      <DateRangePickerDialog
        initialStartDate={value.from.toString()}
        initialEndDate={value.to.toString()}
        confirmButtonLabel={t('generic.ok.button')}
        dismissButtonLabel={t('generic.cancel.button')}
        onDateRangeSelected={({ start, end }) => {
          if (start && end) {
            onConfirm({ from: fromComposeDate(start), to: fromComposeDate(end) });
          }
        }}
        onDismissRequest={onDismiss}
      />
    </Host>
  );
}
