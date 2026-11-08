import { NativeIconProps } from '@/components/foundation/native-icon';
import { SegmentListFormElement } from '@/components/foundation/segmented-list';
import SelectPicker from '@/components/foundation/select-picker';
import { SelectPickerOption, SelectPickerValue } from '@/components/foundation/select-picker/select-picker-props';
import { ReactNode } from 'react';

export function SegmentedListSelect<T extends SelectPickerValue>(props: {
  label: ReactNode;
  supportingText?: ReactNode;
  icon?: NativeIconProps['icon'];
  systemImage?: NativeIconProps['systemImage'];
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
      systemImage={props.systemImage}
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
