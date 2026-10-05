import { Switch } from '@/components/presentation/foundation/switch';
import { AppIconSource } from '@/components/presentation/foundation/ms-icon-source';
import { SegmentListFormElement } from '@/components/presentation/foundation/segmented-list';
import { ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

interface ListSwitchProps {
  label: ReactNode;
  supportingText?: ReactNode;
  icon?: AppIconSource;
  value: boolean;
  onValueChange: (value: boolean) => void;
  testID?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function SegmentedListSwitch(props: ListSwitchProps) {
  return (
    <SegmentListFormElement
      label={props.label}
      supportingText={props.supportingText}
      icon={props.icon}
      onPress={props.disabled ? undefined : () => props.onValueChange(!props.value)}
      style={props.style}
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
