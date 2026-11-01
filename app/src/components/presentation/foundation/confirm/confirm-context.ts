import { createContext } from 'react';
import { Alert, AlertButton } from 'react-native';

export interface Confirmation {
  title: string;
  message: string;
  okText: string;
  cancelText: string;
  destructive?: boolean;
  onOk: () => void;
  onCancel?: () => void;
  additionalAction?: { text: string; onPress: () => void };
}

function presentAlert({
  title,
  message,
  okText,
  cancelText,
  destructive,
  onOk,
  onCancel,
  additionalAction,
}: Confirmation) {
  const buttons: AlertButton[] = [
    { text: cancelText, style: 'cancel', onPress: onCancel },
    ...(additionalAction ? [{ text: additionalAction.text, onPress: additionalAction.onPress }] : []),
    { text: okText, style: destructive ? 'destructive' : 'default', onPress: onOk },
  ];
  Alert.alert(title, message, buttons, { cancelable: true, onDismiss: onCancel });
}

export const ConfirmContext = createContext<(confirmation: Confirmation) => void>(presentAlert);
