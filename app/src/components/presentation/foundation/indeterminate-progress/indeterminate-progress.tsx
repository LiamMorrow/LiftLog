import { InlineHost } from '@/components/presentation/foundation/inline-host';
import { ProgressView } from '@expo/ui/swift-ui';
export function IndeterminateProgress() {
  return (
    <InlineHost matchContents>
      <ProgressView />
    </InlineHost>
  );
}
