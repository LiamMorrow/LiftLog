import { Services } from '@/services';
import { resolveStore } from '@/store';
import { registerDateTranslations } from '@/utils/date-locale';
import { TolgeeProvider } from '@tolgee/react';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseAsync, SQLiteDatabase } from 'expo-sqlite';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { Provider } from 'react-redux';

// Create context for services
const ServicesContext = createContext<Services | null>(null);
export default function ServicesProvider(props: { children: ReactNode }) {
  const [expoDb, setOpDb] = useState<SQLiteDatabase>();
  useEffect(() => {
    void openDatabaseAsync('db.db').then(setOpDb);
  }, [setOpDb]);
  const db = useMemo(() => expoDb && drizzle(expoDb), [expoDb]);
  const resolved = useMemo(() => (db && expoDb ? resolveStore(db, expoDb) : undefined), [db, expoDb]);
  const store = resolved?.store;
  const services = resolved?.services;
  useEffect(() => {
    if (services) {
      registerDateTranslations(services.tolgee);
    }
  }, [services]);
  if (!store || !services) {
    return <></>;
  }

  return (
    <Provider store={store}>
      <ServicesContext.Provider value={services}>
        <TolgeeProvider tolgee={services.tolgee}>{props.children}</TolgeeProvider>
      </ServicesContext.Provider>
    </Provider>
  );
}
export function useServices() {
  const ctx = useContext(ServicesContext);
  if (!ctx) throw new Error('useServices must be used within AppStateProvider');
  return ctx;
}
