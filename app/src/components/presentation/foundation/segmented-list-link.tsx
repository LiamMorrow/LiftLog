import Icon from '@/components/presentation/foundation/icon';
import { AppIconSource } from '@/components/presentation/foundation/ms-icon-source';
import { SegmentListFormElement } from '@/components/presentation/foundation/segmented-list';
import { useAppTheme } from '@/hooks/useAppTheme';
import { ReactNode } from 'react';

export function SegmentedListLink(props: {
  label: ReactNode;
  supportingText?: ReactNode;
  icon?: AppIconSource;
  onPress: () => void;
  testID?: string;
}) {
  const { colors } = useAppTheme();
  return (
    <SegmentListFormElement
      label={props.label}
      supportingText={props.supportingText}
      icon={props.icon}
      onPress={props.onPress}
      right={<Icon source="chevronRight" size={20} color={colors.onSurfaceVariant} />}
    />
  );
}
