import { ServerAiChatResponse } from '@/models/ai-models';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { AsyncIterableSubject } from 'data-async-iterators';

export class AiChatService {
  private connection: HubConnection | undefined;

  async *sendMessage(
    message: string,
  ): AsyncIterableIterator<ServerAiChatResponse> {
    const subject = new AsyncIterableSubject<ServerAiChatResponse>();
    if (!this.connection) {
      this.connection = new HubConnectionBuilder()
        .withUrl('http://127.0.0.1:5264/ai-chat') // TODO url
        .build();

      this.connection.onclose(() => (this.connection = undefined));

      await this.connection.start();
    }
    this.connection.on('ReceiveMessage', async (m: ServerAiChatResponse) => {
      subject.pushValue(m);
    });
    this.connection
      .invoke('SendMessage', message)
      .catch(console.error)
      .finally(() => subject.end());
    yield* subject;
    this.connection.off('ReceiveMessage');
  }
}
