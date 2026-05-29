import { Host, ProgressView } from '@expo/ui/swift-ui';
export function IndeterminateProgress() {
  return (
    <Host matchContents>
      <ProgressView />
    </Host>
  );
}
