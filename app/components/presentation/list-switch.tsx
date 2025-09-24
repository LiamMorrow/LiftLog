import { useAppTheme } from '@/hooks/useAppTheme';
import { ReactNode } from 'react';
import { List, Switch } from 'react-native-paper';

interface ListSwitchProps {
  headline: ReactNode;
  supportingText?: ReactNode;
  value: boolean;
  focus?: boolean;
  onValueChange: (value: boolean) => void;
  testID?: string;
  disabled?: boolean;
}

export default function ListSwitch(props: ListSwitchProps) {
  const { colors } = useAppTheme();
  return (
    <List.Item
      testID={props.testID!}
      title={props.headline}
      style={{
        backgroundColor: props.focus ? colors.tertiary + '33' : undefined!,
      }}
      description={props.supportingText}
      onPress={() => props.onValueChange(!props.value)}
      disabled={props.disabled!}
      right={() => (
        <Switch
          value={props.value}
          disabled={props.disabled!}
          onValueChange={props.onValueChange}
        />
      )}
    />
  );
}
