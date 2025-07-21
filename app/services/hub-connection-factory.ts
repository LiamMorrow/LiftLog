import { HubConnectionBuilder } from '@microsoft/signalr';

export class HubConnectionFactory {
  create(proToken: string) {
    return new HubConnectionBuilder()
      .withUrl('http://127.0.0.1:5264/ai-chat', {
        accessTokenFactory: () => `Web ${proToken}`,
      }) // TODO url
      .build();
  }
}
