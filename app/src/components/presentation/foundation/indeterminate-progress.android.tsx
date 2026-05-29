import { Host, LoadingIndicator } from '@expo/ui/jetpack-compose';
export function IndeterminateProgress() {
  return (
    <Host matchContents>
      <LoadingIndicator />
    </Host>
  );
}
