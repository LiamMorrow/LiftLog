import { HubConnectionBuilder } from '@microsoft/signalr';

export class HubConnectionFactory {
  create(proToken: string) {
    const builder = new HubConnectionBuilder();
    // if (__DEV__) {
    //   return builder
    //     .withUrl('http://127.0.0.1:5264/ai-chat', {
    //       accessTokenFactory: () => `RevenueCat ${proToken}`,
    //     })
    //     .build();
    // }
    return builder
      .withUrl('https://api.liftlog.online/ai-chat', {
        accessTokenFactory: () => `RevenueCat ${proToken}`,
      })
      .build();
  }
}
