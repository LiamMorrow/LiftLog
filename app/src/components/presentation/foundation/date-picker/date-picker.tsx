import { InlineHost } from '@/components/presentation/foundation/inline-host';
import { DatePickerProps } from './date-picker-props';
import { convert, nativeJs } from '@js-joda/core';
import { DatePicker as SwiftDatePicker } from '@expo/ui/swift-ui';
import { accessibilityIdentifier, datePickerStyle, labelsHidden } from '@expo/ui/swift-ui/modifiers';

export function DatePicker({ value, onChange, testID }: DatePickerProps) {
  return (
    <InlineHost matchContents>
      <SwiftDatePicker
        selection={convert(value).toDate()}
        displayedComponents={['date']}
        onDateChange={(date) => onChange(nativeJs(date).toLocalDate())}
        modifiers={[labelsHidden(), datePickerStyle('compact'), ...(testID ? [accessibilityIdentifier(testID)] : [])]}
      />
    </InlineHost>
  );
}
