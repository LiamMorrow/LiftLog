import { useNavigation } from 'expo-router';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react';

type Entry = { prevent: boolean; onPrevent?: () => void };

const PreventNavigateContext = createContext<{
  register: (id: symbol, entry: Entry) => void;
  unregister: (id: symbol) => void;
  getActive: () => Entry | null;
} | null>(null);

export function PreventNavigateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Stack ordered by registration time — last registered = deepest
  const stackRef = useRef<{ id: symbol; entry: Entry }[]>([]);

  const register = useCallback((id: symbol, entry: Entry) => {
    stackRef.current = stackRef.current
      .filter((e) => e.id !== id)
      .concat({ id, entry });
  }, []);

  const unregister = useCallback((id: symbol) => {
    stackRef.current = stackRef.current.filter((e) => e.id !== id);
  }, []);
  const getActive = useCallback((): Entry | null => {
    // Last entry in stack where prevent is true = deepest active consumer
    for (let i = stackRef.current.length - 1; i >= 0; i--) {
      if (stackRef.current[i].entry.prevent) {
        return stackRef.current[i].entry;
      }
    }
    return null;
  }, []);

  return (
    <PreventNavigateContext.Provider
      value={{ register, unregister, getActive }}
    >
      {children}
    </PreventNavigateContext.Provider>
  );
}

function usePreventNavigateContext() {
  const ctx = useContext(PreventNavigateContext);
  if (!ctx)
    throw new Error(
      'usePreventNavigateContext must be used within PreventNavigateProvider',
    );
  return ctx;
}

export function usePreventNavigate(
  prevent: boolean,
  onPrevent?: () => void,
): void {
  const { addListener } = useNavigation();
  const { register, unregister, getActive } = usePreventNavigateContext();

  // Stable identity for this hook instance
  const id = useRef(Symbol()).current;

  // Keep entry current without triggering re-registration
  const entryRef = useRef<{ prevent: boolean; onPrevent?: () => void }>({
    prevent,
    onPrevent,
  });
  useEffect(() => {
    entryRef.current = { prevent, onPrevent };
  });

  // Register/unregister in the stack based on mount/unmount
  useEffect(() => {
    register(id, entryRef.current);
    return () => unregister(id);
  }, [id, register, unregister]);

  // Keep registration current when prevent/onPrevent change
  useEffect(() => {
    register(id, { prevent, onPrevent });
  }, [id, prevent, onPrevent, register]);

  useEffect(() => {
    return addListener('beforeRemove', (e) => {
      const active = getActive();
      if (!active?.prevent) return;
      e.preventDefault();
      active.onPrevent?.();
    });
  }, [addListener, getActive]);
}
