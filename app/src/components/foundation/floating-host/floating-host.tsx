import { useAppTheme } from '@/hooks/useAppTheme';
import { Host, HostProps } from '@expo/ui/jetpack-compose';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

/**
 * A Compose host for controls drawn over other touchable content. Gesture handler sees a host as a
 * transparent view and hands its taps to the gesture handlers underneath, so the host claims them with
 * a gesture that never activates.
 */
export function FloatingHost(props: Omit<HostProps, 'seedColor' | 'colorScheme'>) {
  const { colors } = useAppTheme();
  return (
    <GestureDetector gesture={Gesture.Manual()}>
      <Host {...props} seedColor={colors.seedColor} colorScheme={colors.scheme} />
    </GestureDetector>
  );
}
