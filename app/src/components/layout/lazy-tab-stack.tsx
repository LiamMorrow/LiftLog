import StackWithHeader from '@/components/layout/stack-with-header';
import { useIsFocused } from 'expo-router';
import { useEffect, useState } from 'react';

let idleTurns = Promise.resolve();

function nextIdleTurn() {
  idleTurns = idleTurns.then(() => new Promise<void>((resolve) => requestIdleCallback(() => resolve())));
  return idleTurns;
}

export function LazyTabStack() {
  const isFocused = useIsFocused();
  const [shouldRender, setShouldRender] = useState(isFocused);
  if (isFocused && !shouldRender) {
    setShouldRender(true);
  }

  useEffect(() => {
    let isCancelled = false;
    void nextIdleTurn().then(() => {
      if (!isCancelled) {
        setShouldRender(true);
      }
    });
    return () => {
      isCancelled = true;
    };
  }, []);

  return shouldRender ? <StackWithHeader /> : null;
}
