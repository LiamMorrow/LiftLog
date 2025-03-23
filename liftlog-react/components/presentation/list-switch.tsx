import { Switch } from 'react-native-paper';
import { List } from 'react-native-paper';

interface ListSwitchProps {
  headline: string;
  supportingText: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export default function ListSwitch(props: ListSwitchProps) {
  return (
    <List.Item
      title={props.headline}
      description={props.supportingText}
      onPress={() => props.onValueChange(!props.value)}
      right={() => (
        <Switch value={props.value} onValueChange={props.onValueChange} />
      )}
    />
  );
}
