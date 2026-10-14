import { Linking } from 'react-native';

export function openUrl(url: string) {
  void Linking.canOpenURL(url).then((canOpen) => canOpen && Linking.openURL(url));
}
