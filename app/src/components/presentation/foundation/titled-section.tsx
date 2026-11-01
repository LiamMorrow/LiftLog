import { SectionHeader } from '@/components/presentation/foundation/section-header';
import { spacing } from '@/hooks/useAppTheme';
import { ReactNode } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

export function TitledSection(props: {
  title: string;
  trailing?: ReactNode;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}) {
  return (
    <View style={[{ gap: spacing[2] }, props.style]}>
      <SectionHeader title={props.title} trailing={props.trailing} />
      {props.children}
    </View>
  );
}
