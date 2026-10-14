export interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;

  disabled?: boolean;
  testID?: string;
}
