import { NativeIcon, NativeIconProps } from '@/components/presentation/foundation/native-icon';
import ChevronRightIcon from '@expo/material-symbols/chevron_right.xml';
import { SegmentListFormElement } from '@/components/presentation/foundation/segmented-list';
import { AppText } from '@/components/presentation/foundation/app-text';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

export function SegmentedListLink(props: {
  label: ReactNode;
  supportingText?: ReactNode;
  value?: string;
  icon?: NativeIconProps['icon'];
  systemImage?: NativeIconProps['systemImage'];
  onPress: () => void;
  testID?: string;
}) {
  const { colors } = useAppTheme();
  return (
    <SegmentListFormElement
      testID={props.testID}
      label={props.label}
      supportingText={props.supportingText}
      icon={props.icon}
      systemImage={props.systemImage}
      onPress={props.onPress}
      right={
        <View style={styles.right}>
          {props.value ? (
            <AppText variant="labelLarge" style={{ color: colors.onSurfaceVariant }}>
              {props.value}
            </AppText>
          ) : undefined}
          <NativeIcon
            icon={ChevronRightIcon}
            systemImage="chevron.right"
            size={20}
            mirrored
            color={colors.onSurfaceVariant}
          />
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
});
