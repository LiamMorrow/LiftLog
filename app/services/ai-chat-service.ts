import { AiChatResponse, AiWorkoutPlan } from '@/models/ai-models';
import { SessionBlueprint } from '@/models/session-models';
import { Duration } from '@js-joda/core';
import { HubConnection } from '@microsoft/signalr';
import { AsyncIterableSubject } from 'data-async-iterators';
import { match } from 'ts-pattern';
import BigNumber from 'bignumber.js';
import { parseDuration } from '@/utils/format-date';
import { HubConnectionFactory } from '@/services/hub-connection-factory';

export class AiChatService {
  private connection: HubConnection | undefined;
  constructor(private hunConnectionFactory: HubConnectionFactory) {}

  async *sendMessage(message: string): AsyncIterableIterator<AiChatResponse> {
    const subject = new AsyncIterableSubject<AiChatResponse>();
    if (!this.connection) {
      this.connection = this.hunConnectionFactory.create();

      this.connection.onclose(() => (this.connection = undefined));

      await this.connection.start();
    }
    this.connection.on(
      'ReceiveMessage',
      async (m: JsonResponse<AiChatResponse>) => {
        try {
          subject.pushValue(
            match(m)
              .returnType<AiChatResponse>()
              .with({ type: 'messageResponse' }, (chatMessage) => chatMessage)
              .with({ type: 'chatPlan' }, ({ plan }) => ({
                type: 'chatPlan',
                plan: toAiWorkoutPlan(plan),
              }))
              .exhaustive(),
          );
        } catch (e) {
          console.warn('Failed to parse ai response', e);
        }
      },
    );
    this.connection
      .invoke('SendMessage', message)
      .catch(console.error)
      .finally(() => subject.end());
    yield* subject;
    this.connection?.off('ReceiveMessage');
  }

  async stopInProgress() {
    await this.connection?.send('StopInProgress');
  }

  async restartChat() {
    await this.connection?.send('RestartChat');
  }
}

export type JsonResponse<T> = T extends string | number | boolean | null
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

export function toAiWorkoutPlan(
  aiPlan: JsonResponse<AiWorkoutPlan>,
): AiWorkoutPlan {
  return {
    name: aiPlan.name,
    description: aiPlan.description,
    sessions: aiPlan.sessions.map((s) =>
      SessionBlueprint.fromPOJO({
        name: s.name,
        notes: s.notes,
        exercises: s.exercises.map((ex) => ({
          name: ex.name,
          link: ex.link,
          notes: ex.notes,
          repsPerSet: ex.repsPerSet,
          sets: ex.sets,
          supersetWithNext: ex.supersetWithNext,
          weightIncreaseOnSuccess: new BigNumber(ex.weightIncreaseOnSuccess),
          restBetweenSets: {
            minRest: parseDuration(ex.restBetweenSets.minRest),
            maxRest: parseDuration(ex.restBetweenSets.maxRest),
            failureRest: parseDuration(ex.restBetweenSets.failureRest),
          },
        })),
      }),
    ),
  };
}
