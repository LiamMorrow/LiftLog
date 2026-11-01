import CheckIcon from '@expo/material-symbols/check.xml';
import { NativeIcon } from '@/components/presentation/foundation/native-icon';
import { SegmentListFormElement } from '@/components/presentation/foundation/segmented-list';
import { useAppTheme } from '@/hooks/useAppTheme';
import { ReactNode } from 'react';

export function SegmentedListOption(props: {
  label: ReactNode;
  supportingText?: ReactNode;
  selected: boolean;
  onPress: () => void;
  testID?: string;
}) {
  const { colors } = useAppTheme();
  return (
    <SegmentListFormElement
      testID={props.testID}
      label={props.label}
      supportingText={props.supportingText}
      onPress={props.onPress}
      right={
        props.selected ? (
          <NativeIcon icon={CheckIcon} systemImage="checkmark" size={20} color={colors.primary} />
        ) : undefined
      }
    />
  );
}
