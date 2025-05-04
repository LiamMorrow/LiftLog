import { Loader } from '@/components/presentation/loader';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAppSelector } from '@/store';
import { ReactNode } from 'react';
import { View } from 'react-native';

export default function AppStateProvider(props: { children: ReactNode }) {
  const isHydrated = useAppSelector(
    (s) =>
      s.app.isHydrated &&
      s.currentSession.isHydrated &&
      s.program.isHydrated &&
      s.settings.isHydrated,
  );
  const { colors } = useAppTheme();

  return isHydrated ? (
    props.children
  ) : (
    <View
      style={{ flex: 1, backgroundColor: colors.surface, alignItems: 'center' }}
    >
      <Loader />
    </View>
  );
}
