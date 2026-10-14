import LimitedHtml from '@/components/presentation/foundation/limited-html';
import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { spacing } from '@/hooks/useAppTheme';
import { View } from 'react-native';

export function PageCaption(props: { value: string }) {
  return (
    <View style={{ marginHorizontal: spacing.pageHorizontalMargin, marginBottom: spacing[4] }}>
      <SurfaceText color="onSurfaceVariant" font="text-sm">
        <LimitedHtml value={props.value} />
      </SurfaceText>
    </View>
  );
}
