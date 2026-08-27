import { useAppTheme } from '@/hooks/useAppTheme';
import { Host, ProgressView } from '@expo/ui/swift-ui';
export function IndeterminateProgress() {
  const { colors } = useAppTheme();
  return (
    <Host matchContents seedColor={colors.seedColor} colorScheme={colors.scheme}>
      <ProgressView />
    </Host>
  );
}
