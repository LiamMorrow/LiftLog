import { SurfaceText } from '@/components/presentation/surface-text';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { ReactNode } from 'react';
import { View } from 'react-native';
import { Icon } from 'react-native-paper';

export default function LabelledFormRow(props: {
  icon: string;
  label: string;
  children: ReactNode;
  undoFormPadding?: boolean;
}) {
  const { colors } = useAppTheme();
  const margin = props.undoFormPadding ? { marginHorizontal: -spacing[6] } : {};
  return (
    <View style={{ gap: spacing[3] }}>
      <View
        style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}
      >
        <Icon source={props.icon} size={20} color={colors.onSurface} />
        <SurfaceText font="text-xl">{props.label}</SurfaceText>
      </View>
      <View style={margin}>{props.children}</View>
    </View>
  );
}
