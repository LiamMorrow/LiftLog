import { SwitchProps } from '@/components/presentation/foundation/gesture-wrappers/switch-props';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Host, Switch as NativeSwitch } from '@expo/ui/jetpack-compose';

export function Switch(props: SwitchProps) {
  const { colors } = useAppTheme();
  return (
    <Host matchContents style={{ marginBlock: -14 }} seedColor={colors.seedColor}>
      <NativeSwitch value={props.value} onCheckedChange={props.onValueChange} enabled={!props.disabled} />
    </Host>
  );
}
