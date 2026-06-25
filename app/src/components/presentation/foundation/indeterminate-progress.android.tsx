import { useAppTheme } from '@/hooks/useAppTheme';
import { Host, LoadingIndicator } from '@expo/ui/jetpack-compose';
export function IndeterminateProgress() {
  const { colors } = useAppTheme();
  return (
    <Host matchContents>
      <LoadingIndicator color={colors.primary} />
    </Host>
  );
}
