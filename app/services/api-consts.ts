import { Platform } from 'react-native';

export const apiBaseUrl = __DEV__
  ? Platform.OS === 'android'
    ? 'http://10.0.2.2:5264'
    : 'http://127.0.0.1:5264'
  : 'https://api.liftlog.online';
