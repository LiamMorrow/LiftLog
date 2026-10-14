import { AppIconSource } from '@/components/presentation/foundation/ms-icon-source';
import { SegmentListFormElement } from '@/components/presentation/foundation/segmented-list';
import SelectPicker from '@/components/presentation/foundation/select-picker';
import {
  SelectPickerOption,
  SelectPickerValue,
} from '@/components/presentation/foundation/select-picker/select-picker-props';
import { ReactNode } from 'react';

export function SegmentedListSelect<T extends SelectPickerValue>(props: {
  label: ReactNode;
  supportingText?: ReactNode;
  icon?: AppIconSource;
  value: T;
  options: SelectPickerOption<T>[];
  onChange: (value: T) => void;
  enabled?: boolean;
  testID?: string;
}) {
  return (
    <SegmentListFormElement
      label={props.label}
      supportingText={props.supportingText}
      icon={props.icon}
      right={
        <SelectPicker
          value={props.value}
          options={props.options}
          onChange={props.onChange}
          enabled={props.enabled}
          testID={props.testID}
        />
      }
    />
  );
}
