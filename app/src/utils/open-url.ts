import { Linking } from 'react-native';

export function openUrl(url: string) {
  void Linking.canOpenURL(url).then(async (canOpen) => {
    if (canOpen) {
      await Linking.openURL(url);
    }
  });
}
