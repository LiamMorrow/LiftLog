import { LocalDateRange } from '@/models/time-models';

export interface DateRangePickerProps {
  visible: boolean;
  value: LocalDateRange;
  onConfirm: (value: LocalDateRange) => void;
  onDismiss: () => void;
}
