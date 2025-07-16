import { HubConnectionBuilder } from '@microsoft/signalr';

export class HubConnectionFactory {
  create() {
    return new HubConnectionBuilder()
      .withUrl('http://127.0.0.1:5264/ai-chat') // TODO url
      .build();
  }
}
