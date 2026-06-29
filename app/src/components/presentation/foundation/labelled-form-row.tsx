import { FormRow } from '@/components/presentation/foundation/form-row';
import { AppIconSource } from '@/components/presentation/foundation/ms-icon-source';
import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { ReactNode } from 'react';
import { View } from 'react-native';
import { Icon } from 'react-native-paper';

export default function LabelledFormRow(props: {
  icon: Extract<AppIconSource, `${string}Fill`>;
  label: string;
  children: ReactNode;
  undoFormPadding?: boolean;
  noGap?: boolean;
}) {
  const { colors } = useAppTheme();
  const labelPadding = props.undoFormPadding
    ? {
        paddingHorizontal: spacing.pageHorizontalMargin,
      }
    : {};
  return (
    <FormRow noGap={props.noGap} undoFormPadding={props.undoFormPadding}>
      <View style={[{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }, labelPadding]}>
        <Icon source={props.icon} size={20} color={colors.primary} />
        <SurfaceText font="text-xl">{props.label}</SurfaceText>
      </View>
      <View>{props.children}</View>
    </FormRow>
  );
}
