import { AppText } from '@/components/presentation/foundation/app-text';
import { Icon } from '@/components/presentation/foundation/icon';
import { AppIconSource } from '@/components/presentation/foundation/ms-icon-source';
import TouchableRipple from '@/components/presentation/foundation/touchable-ripple';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { View } from 'react-native';

export function Chip(props: {
  children: string;
  onPress: () => void;
  selected?: boolean;
  mode?: 'flat' | 'outlined';
  icon?: AppIconSource;
  showSelectedCheck?: boolean;
  testID?: string;
}) {
  const { colors } = useAppTheme();
  const { selected = false, mode = 'flat', showSelectedCheck = true } = props;
  const icon = props.icon ?? (selected && showSelectedCheck ? 'check' : undefined);
  const contentColor = selected ? colors.onSecondaryContainer : colors.onSurfaceVariant;
  const backgroundColor = selected || mode === 'flat' ? colors.secondaryContainer : colors.surface;

  return (
    <TouchableRipple
      testID={props.testID}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={props.onPress}
      style={{
        height: 32,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor,
        borderWidth: mode === 'outlined' && !selected ? 1 : 0,
        borderColor: colors.outline,
      }}
    >
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing[2],
          paddingInlineStart: icon ? spacing[2] : spacing[4],
          paddingInlineEnd: spacing[4],
        }}
      >
        {icon ? <Icon source={icon} size={18} color={contentColor} /> : undefined}
        <AppText variant="labelLarge" style={{ color: contentColor }}>
          {props.children}
        </AppText>
      </View>
    </TouchableRipple>
  );
}
