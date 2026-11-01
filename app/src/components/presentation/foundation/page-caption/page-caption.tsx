import LimitedHtml from '@/components/presentation/foundation/limited-html';
import { AppText } from '@/components/presentation/foundation/app-text';
import { spacing } from '@/hooks/useAppTheme';
import { View } from 'react-native';

export function PageCaption(props: { value: string }) {
  return (
    <View style={{ marginHorizontal: spacing.pageHorizontalMargin, marginBottom: spacing[4] }}>
      <AppText variant="bodyMedium" color="onSurfaceVariant">
        <LimitedHtml value={props.value} />
      </AppText>
    </View>
  );
}
