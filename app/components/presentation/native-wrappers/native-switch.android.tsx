import { Switch } from '@expo/ui/jetpack-compose';

export interface NativeSwitchProps {
  value: boolean;
  disabled?: boolean;
  onValueChange: (v: boolean) => void;
}

export default function NativeSwitch(props: NativeSwitchProps) {
  return <Switch value={props.value} onValueChange={props.onValueChange} />;
}
