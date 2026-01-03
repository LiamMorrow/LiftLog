import { apiBaseUrl } from '@/services/api-consts';
import { HubConnectionBuilder } from '@microsoft/signalr';

export class HubConnectionFactory {
  create(proToken: string) {
    const builder = new HubConnectionBuilder();
    if (__DEV__) {
      return builder
        .withUrl(`${apiBaseUrl}/ai-chat`, {
          accessTokenFactory: () => `Web test-web-auth-key-12345`,
        })
        .build();
    }
    return builder
      .withUrl(`${apiBaseUrl}/ai-chat`, {
        accessTokenFactory: () => `RevenueCat ${proToken}`,
      })
      .build();
  }
}
