import {
  NativeSyntheticEvent,
  requireNativeComponent,
  ViewStyle,
} from 'react-native';

interface MaterialSwitchChangeEvent {
  value: boolean;
}

interface MaterialSwitchProps {
  value: boolean;
  onChange?: (event: NativeSyntheticEvent<MaterialSwitchChangeEvent>) => void;
  style?: ViewStyle;
}

const NativeMaterialSwitch =
  requireNativeComponent<MaterialSwitchProps>('MaterialSwitch');

export const MaterialSwitch: React.FC<MaterialSwitchProps> = (props) => {
  return <NativeMaterialSwitch {...props} />;
};
