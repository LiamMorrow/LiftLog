import { ActionCreator, addListener, UnknownAction } from '@reduxjs/toolkit';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

type EffectFn<T> = (action: T) => void;

export function useActionEffect(
  allActions: undefined,
  effect: EffectFn<UnknownAction>,
): void;
export function useActionEffect<TAction extends { type: string }>(
  action: TAction[],
  effect: EffectFn<UnknownAction>,
): void;
export function useActionEffect<TAction extends { type: string }>(
  action: TAction,
  effect: EffectFn<TAction extends ActionCreator<infer U> ? U : TAction>,
): void;
export function useActionEffect(
  actionPredicate: { type: string } | { type: string }[] | undefined,
  effect: EffectFn<UnknownAction>,
) {
  const dispatch = useDispatch();
  // @ts-expect-error dispatch returns unsubscribe when addListener is dispatched
  useEffect(() => {
    const unsubscribe = dispatch(
      addListener({
        predicate: (action) =>
          !actionPredicate ||
          [actionPredicate].flat().some((x) => x.type === action.type),
        effect: (action) => {
          effect(action);
        },
      }),
    );
    return unsubscribe;
  }, [actionPredicate, dispatch, effect]);
}
