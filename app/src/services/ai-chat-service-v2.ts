import { AiChatResponseV2, AiChatResponseV2Json, aiPlanFromJSON } from '@/models/ai-models';
import { aiPlanMigrations } from '@/models/storage/versions/migrations';

import { HubConnection, HubConnectionState } from '@microsoft/signalr';
import { AsyncIterableSubject } from 'data-async-iterators';
import { match, P } from 'ts-pattern';
import { HubConnectionFactory } from '@/services/hub-connection-factory';
import { RootState } from '@/store';
import Purchases from 'react-native-purchases';
import { selectPreferredWeightUnit } from '@/store/settings';

/**
 * AI chat service connecting to the `/ai-chat-v2` hub.
 */
export class AiChatServiceV2 {
  private connection: HubConnection | undefined;
  constructor(
    private hubConnectionFactory: HubConnectionFactory,
    private getState: () => RootState,
  ) {}

  async *introduce(): AsyncIterableIterator<AiChatResponseV2> {
    const proToken = this.getState().settings.proToken;
    const preferredWeightUnit = selectPreferredWeightUnit(this.getState());
    if (!proToken) {
      yield {
        type: 'purchasePro',
      };
      return;
    }
    const subject = await this.setupResponseListening(proToken);
    void this.connection
      ?.invoke(
        'Introduce',
        Intl.DateTimeFormat().resolvedOptions().locale,
        aiPlanMigrations.latestVersion,
        preferredWeightUnit,
      )
      .finally(() => subject.end());
    yield* subject;
    this.connection?.off('ReceiveMessage');
  }

  async *sendMessage(message: string): AsyncIterableIterator<AiChatResponseV2> {
    const proToken = this.getState().settings.proToken;
    if (!proToken) {
      yield {
        type: 'purchasePro',
      };
      return;
    }
    const subject = await this.setupResponseListening(proToken);
    void this.connection?.invoke('SendMessage', message, aiPlanMigrations.latestVersion).finally(() => subject.end());
    yield* subject;
    this.connection?.off('ReceiveMessage');
  }

  async stopInProgress() {
    await this.connection?.send('StopInProgress');
  }

  async restartChat() {
    if (this.connection && this.connection.state !== HubConnectionState.Connected) {
      await this.connection.stop().catch(console.error);
      this.connection = undefined;
    }
    if (this.connection?.state === HubConnectionState.Connected) {
      await this.connection.send('RestartChat');
    }
  }

  private async setupResponseListening(proToken: string) {
    const subject = new AsyncIterableSubject<AiChatResponseV2>();
    if (!this.connection) {
      this.connection = this.hubConnectionFactory.create(proToken, '/ai-chat-v2');

      this.connection.onclose((e) => {
        this.connection = undefined;
        if (e) {
          console.error(e);
        }
      });

      await this.connection.start().catch(async (e) => {
        this.connection = undefined;
        if (e) {
          console.error(e);
          await Purchases.syncPurchases().catch(console.error);
        }
      });
    }
    if (!this.connection) {
      subject.pushValue({
        type: 'messageResponse',
        message: 'Failed to connect to server. Please refresh and try again with a strong internet connection',
      });
      subject.end();
      return subject;
    }
    this.connection.on('ReceiveMessage', async (m: AiChatResponseV2Json) => {
      try {
        subject.pushValue(
          match(m)
            .returnType<AiChatResponseV2>()
            .with(
              {
                type: P.union('messageResponse', 'purchasePro', 'updateRequired'),
              },
              (chatMessage) => chatMessage,
            )
            .with({ type: 'chatPlan' }, (plan) => ({
              type: 'chatPlan' as const,
              plan: aiPlanFromJSON(plan),
            }))
            .exhaustive(),
        );
      } catch (e) {
        console.warn('Failed to parse ai response', e);
      }
    });
    return subject;
  }
}
