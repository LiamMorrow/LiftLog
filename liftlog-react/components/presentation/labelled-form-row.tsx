import { SurfaceText } from '@/components/presentation/surface-text';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { ReactNode } from 'react';
import { View } from 'react-native';
import { Icon } from 'react-native-paper';
import { IconSource } from 'react-native-paper/lib/typescript/components/Icon';

export default function LabelledFormRow(props: {
  icon: IconSource;
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
        <Icon
          source={(props.icon as string) + 'Fill'}
          size={20}
          color={colors.primary}
        />
        <SurfaceText font="text-xl">{props.label}</SurfaceText>
      </View>
      <View style={margin}>{props.children}</View>
    </View>
  );
}
