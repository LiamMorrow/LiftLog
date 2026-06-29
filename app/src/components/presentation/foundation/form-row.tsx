import { spacing } from '@/hooks/useAppTheme';
import { ReactNode } from 'react';
import { View } from 'react-native';

export function FormRow(props: {
  children: ReactNode;
  undoFormPadding?: boolean | undefined;
  noGap?: boolean | undefined;
}) {
  const margin = props.undoFormPadding ? { marginHorizontal: -spacing.pageHorizontalMargin } : {};
  const gap = props.noGap ? {} : { gap: spacing[3] };
  return <View style={[margin, gap]}>{props.children}</View>;
}
