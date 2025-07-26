import { HubConnectionBuilder } from '@microsoft/signalr';
import { Platform } from 'react-native';
import { match, P } from 'ts-pattern';

export class HubConnectionFactory {
  create(proToken: string) {
    const builder = new HubConnectionBuilder();
    if (__DEV__) {
      return builder
        .withUrl('http://127.0.0.1:5264/ai-chat', {
          accessTokenFactory: () => `Web ${proToken}`,
        })
        .build();
    }
    const store = match(Platform.OS)
      .with(P.union('ios', 'macos'), () => 'Apple')
      .with('android', () => 'Google')
      .with(P.union('web', 'windows'), () => 'Web')
      .exhaustive();
    return builder
      .withUrl('https://api.liftlog.online/ai-chat', {
        accessTokenFactory: () => `${store} ${proToken}`,
      })
      .build();
  }
}
