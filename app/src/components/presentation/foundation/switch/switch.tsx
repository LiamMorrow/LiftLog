import { SwitchProps } from './switch-props';
import { Switch as PaperSwitch } from 'react-native-paper';

export function Switch(props: SwitchProps) {
  return <PaperSwitch {...props} />;
}
