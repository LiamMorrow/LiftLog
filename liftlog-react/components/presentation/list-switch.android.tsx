import { ReactNode, useEffect, useState } from 'react';
import { List, Switch } from 'react-native-paper';

interface ListSwitchProps {
  headline: ReactNode;
  supportingText: ReactNode;
  value: boolean;
  onValueChange: (value: boolean) => void;
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

  return (
    <List.Item
      title={props.headline}
      description={props.supportingText}
      onPress={() => props.onValueChange(!props.value)}
      right={() =>
        delayRender && (
          <Switch value={props.value} onValueChange={props.onValueChange} />
        )
      }
    />
  );
}
