import { useAppTheme } from '@/hooks/useAppTheme';
import { ReactNode, useEffect, useState } from 'react';
import { List, Switch } from 'react-native-paper';

interface ListSwitchProps {
  headline: ReactNode;
  supportingText: ReactNode;
  value: boolean;
  focus?: boolean;
  onValueChange: (value: boolean) => void;
  testID?: string;
  disabled?: boolean;
}
// Workaround - mount the switch after initial render. See: https://github.com/react-navigation/react-navigation/issues/8658#issuecomment-898486182
function useDelay() {
  const [gate, setGate] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setGate(true);
    }, 10);
  });
  return gate;
}

export default function ListSwitch(props: ListSwitchProps) {
  const delayRender = useDelay();
  const { colors } = useAppTheme();

  return (
    <List.Item
      testID={props.testID!}
      title={props.headline}
      description={props.supportingText}
      onPress={() => props.onValueChange(!props.value)}
      style={{
        backgroundColor: props.focus ? colors.tertiary + '33' : undefined!,
      }}
      disabled={props.disabled!}
      right={() =>
        delayRender && (
          <Switch
            value={props.value}
            disabled={props.disabled!}
            onValueChange={props.onValueChange}
          />
        )
      }
    />
  );
}
