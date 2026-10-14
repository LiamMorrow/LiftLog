import { AiChatResponseV2, AiChatResponseV2Json, aiPlanFromJSON } from '@/models/ai-models';
import { aiPlanMigrations } from '@/models/storage/versions/migrations';
import { HubConnection, HubConnectionState } from '@microsoft/signalr';
import { AsyncIterableSubject } from 'data-async-iterators';
import { match, P } from 'ts-pattern';
import { HubConnectionFactory } from '@/services/hub-connection-factory';
import { selectBackendForFeature } from '@/store/backends';
import { ResolvedBackendForFeature } from '@/models/backend';
import { RootState } from '@/store';
import Purchases from 'react-native-purchases';
import { selectPreferredWeightUnit } from '@/store/settings';

/** A connection belongs to the address and headers it was opened with; either changing needs a new one. */
const connectionKeyFor = (backend: ResolvedBackendForFeature) => JSON.stringify([backend.url, backend.headers]);

/**
 * AI chat service connecting to the `/ai-chat-v2` hub.
 */
export class AiChatServiceV2 {
  private connection: HubConnection | undefined;
  /** Which backend the live connection was opened against.  */
  private connectedTo: string | undefined;
  constructor(
    private hubConnectionFactory: HubConnectionFactory,
    private getState: () => RootState,
  ) {}

  async *introduce(): AsyncIterableIterator<AiChatResponseV2> {
    const preferredWeightUnit = selectPreferredWeightUnit(this.getState());
    if (this.requiresPro()) {
      yield {
        type: 'purchasePro',
      };
      return;
    }
    const subject = await this.setupResponseListening();
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
    if (this.requiresPro()) {
      yield {
        type: 'purchasePro',
      };
      return;
    }
    const subject = await this.setupResponseListening();
    void this.connection?.invoke('SendMessage', message, aiPlanMigrations.latestVersion).finally(() => subject.end());
    yield* subject;
    this.connection?.off('ReceiveMessage');
  }

  async stopInProgress() {
    await this.connection?.send('StopInProgress');
  }

  async restartChat() {
    const backend = selectBackendForFeature(this.getState(), 'aiPlanner');
    const isStale = !backend || this.connectedTo !== connectionKeyFor(backend);
    if (this.connection && (isStale || this.connection.state !== HubConnectionState.Connected)) {
      await this.dropConnection();
    }
    // A restart on the server we are already on keeps the connection; a new server gets a new one.
    if (this.connection?.state === HubConnectionState.Connected) {
      await this.connection.send('RestartChat');
    }
  }

  private async dropConnection() {
    const connection = this.connection;
    this.connection = undefined;
    this.connectedTo = undefined;
    await connection?.stop().catch(console.error);
  }

  private requiresPro(): boolean {
    return selectBackendForFeature(this.getState(), 'aiPlanner')?.requiresPro ?? true;
  }

  private async setupResponseListening() {
    const subject = new AsyncIterableSubject<AiChatResponseV2>();
    const backend = selectBackendForFeature(this.getState(), 'aiPlanner');
    if (!backend) {
      subject.pushValue({
        type: 'messageResponse',
        message: 'No backend is configured for the AI planner.',
      });
      subject.end();
      return subject;
    }
    const connectionKey = connectionKeyFor(backend);
    if (this.connection && this.connectedTo !== connectionKey) {
      await this.dropConnection();
    }
    if (!this.connection) {
      const connection = this.hubConnectionFactory.create(backend, '/ai-chat-v2');
      this.connection = connection;
      this.connectedTo = connectionKey;

      connection.onclose((e) => {
        // A connection we already replaced closing must not take the new one down with it.
        if (this.connection === connection) {
          this.connection = undefined;
          this.connectedTo = undefined;
        }
        if (e) {
          console.error(e);
        }
      });

      await connection.start().catch(async (e) => {
        this.connection = undefined;
        this.connectedTo = undefined;
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
