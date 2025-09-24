import { useAppTheme } from '@/hooks/useAppTheme';
import { Host, Switch } from '@expo/ui/swift-ui';

export interface NativeSwitchProps {
  value: boolean;
  disabled?: boolean;
  onValueChange: (v: boolean) => void;
}

export default function NativeSwitch(props: NativeSwitchProps) {
  const { colors } = useAppTheme();
  return (
    <Host>
      <Switch
        value={props.value}
        onValueChange={props.onValueChange}
        color={colors.primary}
      />
    </Host>
  );
}
