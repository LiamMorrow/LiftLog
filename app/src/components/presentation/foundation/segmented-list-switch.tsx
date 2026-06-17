import { Switch } from '@/components/presentation/foundation/gesture-wrappers/switch';
import { AppIconSource } from '@/components/presentation/foundation/ms-icon-source';
import { SegmentListFormElement } from '@/components/presentation/foundation/segmented-list';

interface ListSwitchProps {
  label: string;
  icon: AppIconSource;
  value: boolean;
  onValueChange: (value: boolean) => void;
  testID?: string;
  disabled?: boolean;
}

export function SegmentedListSwitch(props: ListSwitchProps) {
  return (
    <SegmentListFormElement
      label={props.label}
      icon={props.icon}
      onPress={() => props.onValueChange(!props.value)}
      right={
        <Switch
          value={props.value}
          disabled={props.disabled}
          testID={props.testID}
          onValueChange={props.onValueChange}
        />
      }
    />
  );
}
