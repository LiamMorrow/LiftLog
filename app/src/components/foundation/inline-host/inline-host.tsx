import { useAppTheme } from '@/hooks/useAppTheme';
import { Host, HostProps } from '@expo/ui/swift-ui';

/**
 * A SwiftUI host for controls laid out inline by React Native. A host that mounts offscreen picks up
 * the home indicator's safe area and SwiftUI keeps drawing its content shifted until something
 * relayouts it, so inline hosts ignore the safe area entirely.
 */
export function InlineHost(props: Omit<HostProps, 'seedColor' | 'colorScheme' | 'ignoreSafeArea'>) {
  const { colors } = useAppTheme();
  return <Host {...props} ignoreSafeArea="all" seedColor={colors.seedColor} colorScheme={colors.scheme} />;
}
