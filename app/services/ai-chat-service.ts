import { AiChatResponse, AiWorkoutPlan } from '@/models/ai-models';
import {
  CardioTarget,
  ExerciseBlueprint,
  ExerciseBlueprintPOJO,
  SessionBlueprint,
} from '@/models/blueprint-models';
import { Duration } from '@js-joda/core';
import { HubConnection, HubConnectionState } from '@microsoft/signalr';
import { AsyncIterableSubject } from 'data-async-iterators';
import { match, P } from 'ts-pattern';
import BigNumber from 'bignumber.js';
import { parseDuration } from '@/utils/format-date';
import { HubConnectionFactory } from '@/services/hub-connection-factory';
import { RootState } from '@/store';
import * as Sentry from '@sentry/react-native';
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
    this.connection
      ?.invoke('Introduce', Intl.DateTimeFormat().resolvedOptions().locale)
      .catch(Sentry.captureException)
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
    this.connection
      ?.invoke('SendMessage', message)
      .catch(Sentry.captureException)
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
          Sentry.captureException(e);
        }
      });

      await this.connection.start().catch(async (e) => {
        this.connection = undefined;
        if (e) {
          console.error(e);
          Sentry.captureException(e);
          await Purchases.syncPurchases().catch(Sentry.captureException);
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
                plan: toAiWorkoutPlan(plan),
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
        exercises: s.exercises.map(parseAiExercise),
      }),
    ),
  };
}

function parseAiExercise(
  ex: JsonResponse<ExerciseBlueprint>,
): ExerciseBlueprintPOJO {
  if ('repsPerSet' in ex) {
    return {
      type: 'WeightedExerciseBlueprint',
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
    };
  }

  return {
    type: 'CardioExerciseBlueprint',
    name: ex.name,
    link: ex.link,
    notes: ex.notes,
    target: match(ex.target)
      .returnType<CardioTarget>()
      .with({ type: 'distance' }, (t) => ({
        type: 'distance',
        value: { value: BigNumber(t.value.value), unit: t.value.unit },
      }))
      .with({ type: 'time' }, (t) => ({
        type: 'time',
        value: parseDuration(t.value),
      }))
      .exhaustive(),
    trackDistance: ex.trackDistance,
    trackIncline: ex.trackIncline,
    trackResistance: ex.trackResistance,
    trackDuration: ex.trackDuration,
  };
}
