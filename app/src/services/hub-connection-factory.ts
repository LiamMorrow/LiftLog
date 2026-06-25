import { apiBaseUrl } from '@/services/api-consts';
import { HubConnectionBuilder } from '@microsoft/signalr';

export class HubConnectionFactory {
  create(proToken: string, path: string) {
    const builder = new HubConnectionBuilder();
    if (__DEV__) {
      return builder
        .withUrl(`${apiBaseUrl}${path}`, {
          accessTokenFactory: () => `Web test-web-auth-key-12345`,
        })
        .build();
    }
    return builder
      .withUrl(`${apiBaseUrl}${path}`, {
        accessTokenFactory: () => `RevenueCat ${proToken}`,
      })
      .build();
  }
}
