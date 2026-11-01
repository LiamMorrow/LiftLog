import { NativeIcon, NativeIconProps } from '@/components/presentation/foundation/native-icon';
import ChevronRightIcon from '@expo/material-symbols/chevron_right.xml';
import { SegmentListFormElement } from '@/components/presentation/foundation/segmented-list';
import { useAppTheme } from '@/hooks/useAppTheme';
import { ReactNode } from 'react';

export function SegmentedListLink(props: {
  label: ReactNode;
  supportingText?: ReactNode;
  icon?: NativeIconProps['icon'];
  systemImage?: NativeIconProps['systemImage'];
  onPress: () => void;
  testID?: string;
}) {
  const { colors } = useAppTheme();
  return (
    <SegmentListFormElement
      label={props.label}
      supportingText={props.supportingText}
      icon={props.icon}
      systemImage={props.systemImage}
      onPress={props.onPress}
      right={
        <NativeIcon
          icon={ChevronRightIcon}
          systemImage="chevron.right"
          size={20}
          mirrored
          color={colors.onSurfaceVariant}
        />
      }
    />
  );
}
