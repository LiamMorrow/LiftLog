import {
  AiChatResponse,
  AiExerciseBlueprint,
  AiWorkoutPlan,
} from '@/models/ai-models';

import { Duration } from '@js-joda/core';
import { HubConnection, HubConnectionState } from '@microsoft/signalr';
import { AsyncIterableSubject } from 'data-async-iterators';
import { match, P } from 'ts-pattern';
import BigNumber from 'bignumber.js';
import { parseDuration } from '@/utils/format-date';
import { HubConnectionFactory } from '@/services/hub-connection-factory';
import { RootState } from '@/store';
import Purchases from 'react-native-purchases';

export class AiChatService {
  private connection: HubConnection | undefined;
  constructor(
    private hubConnectionFactory: HubConnectionFactory,
    private getState: () => RootState,
  ) {}

  async *introduce(): AsyncIterableIterator<AiChatResponse> {
    const proToken = this.getState().settings.proToken;
    if (!proToken) {
      yield {
        type: 'purchasePro',
      };
      return;
    }
    const subject = await this.setupResponseListening(proToken);
    void this.connection
      ?.invoke('Introduce', Intl.DateTimeFormat().resolvedOptions().locale)
      .finally(() => subject.end());
    yield* subject;
    this.connection?.off('ReceiveMessage');
  }

  async *sendMessage(message: string): AsyncIterableIterator<AiChatResponse> {
    const proToken = this.getState().settings.proToken;
    if (!proToken) {
      yield {
        type: 'purchasePro',
      };
      return;
    }
    const subject = await this.setupResponseListening(proToken);
    void this.connection
      ?.invoke('SendMessage', message)
      .finally(() => subject.end());
    yield* subject;
    this.connection?.off('ReceiveMessage');
  }

  async stopInProgress() {
    await this.connection?.send('StopInProgress');
  }

  async restartChat() {
    if (
      this.connection &&
      this.connection.state !== HubConnectionState.Connected
    ) {
      await this.connection.stop().catch(console.error);
      this.connection = undefined;
    }
    if (this.connection?.state === HubConnectionState.Connected) {
      await this.connection.send('RestartChat');
    }
  }

  private async setupResponseListening(proToken: string) {
    const subject = new AsyncIterableSubject<AiChatResponse>();
    if (!this.connection) {
      this.connection = this.hubConnectionFactory.create(proToken);

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
        message:
          'Failed to connect to server. Please refresh and try again with a strong internet connection',
      });
      subject.end();
      return subject;
    }
    this.connection.on(
      'ReceiveMessage',
      async (m: JsonResponse<AiChatResponse>) => {
        try {
          subject.pushValue(
            match(m)
              .returnType<AiChatResponse>()
              .with(
                { type: P.union('messageResponse', 'purchasePro') },
                (chatMessage) => chatMessage,
              )
              .with({ type: 'chatPlan' }, ({ plan }) => ({
                type: 'chatPlan',
                plan: parseJson(plan),
              }))
              .exhaustive(),
          );
        } catch (e) {
          console.warn('Failed to parse ai response', e);
        }
      },
    );
    return subject;
  }
}

type JsonResponse<T> = T extends string | number | boolean | null
  ? T
  : T extends Duration
    ? string
    : T extends BigNumber
      ? number
      : T extends (infer U)[]
        ? JsonResponse<U>[]
        : T extends object
          ? { [K in keyof T]: JsonResponse<T[K]> }
          : never;

function parseJson(aiPlan: JsonResponse<AiWorkoutPlan>): AiWorkoutPlan {
  return {
    description: aiPlan.description,
    name: aiPlan.name,
    sessions: aiPlan.sessions.map((s) => ({
      name: s.name,
      exercises: s.exercises.map(parseAiExercise),
      notes: s.notes,
    })),
  };
}

function parseAiExercise(
  ex: JsonResponse<AiExerciseBlueprint>,
): AiExerciseBlueprint {
  return {
    ...ex,
    weightIncreaseOnSuccess: BigNumber(ex.weightIncreaseOnSuccess),
    restBetweenSets: {
      minRest: parseDuration(ex.restBetweenSets.minRest),
      maxRest: parseDuration(ex.restBetweenSets.maxRest),
      failureRest: parseDuration(ex.restBetweenSets.failureRest),
    },
  };
}
