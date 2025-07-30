import { useNavigation } from 'expo-router';
import { useEffect } from 'react';

/**
 * Prevents navigation away from the page on back press if prevent is true
 * Allows specifying a callback to call when navigation was prevented in this manner
 */
export function usePreventNavigate(
  prevent: boolean,
  onPrevent?: () => void,
): void {
  const { addListener } = useNavigation();
  useEffect(
    () =>
      addListener('beforeRemove', (e) => {
        if (!prevent) {
          return;
        }
        e.preventDefault();
        onPrevent?.();
      }),
    [addListener, onPrevent, prevent],
  );
}
