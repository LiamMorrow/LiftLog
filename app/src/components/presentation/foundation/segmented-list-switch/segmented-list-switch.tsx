import { Switch } from '@/components/presentation/foundation/switch';
import { NativeIconProps } from '@/components/presentation/foundation/native-icon';
import { SegmentListFormElement } from '@/components/presentation/foundation/segmented-list';
import { useAppTheme } from '@/hooks/useAppTheme';
import { ReactNode } from 'react';

interface ListSwitchProps {
  label: ReactNode;
  supportingText?: ReactNode;
  icon?: NativeIconProps['icon'];
  systemImage?: NativeIconProps['systemImage'];
  value: boolean;
  onValueChange: (value: boolean) => void;
  testID?: string;
  disabled?: boolean;
  focus?: boolean;
}

export function SegmentedListSwitch(props: ListSwitchProps) {
  const { colors } = useAppTheme();
  return (
    <SegmentListFormElement
      label={props.label}
      supportingText={props.supportingText}
      icon={props.icon}
      systemImage={props.systemImage}
      onPress={props.disabled ? undefined : () => props.onValueChange(!props.value)}
      style={props.focus ? { backgroundColor: colors.tertiary + '33' } : undefined}
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
