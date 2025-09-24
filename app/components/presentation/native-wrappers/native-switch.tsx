import { Switch } from 'react-native-paper';

export interface NativeSwitchProps {
  value: boolean;
  disabled?: boolean;
  onValueChange: (v: boolean) => void;
}

export default function NativeSwitch(props: NativeSwitchProps) {
  return (
    <Switch
      value={props.value}
      disabled={!!props.disabled}
      onValueChange={props.onValueChange}
    />
  );
}
