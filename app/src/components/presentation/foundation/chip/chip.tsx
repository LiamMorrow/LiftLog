import { AppText } from '@/components/presentation/foundation/app-text';
import { NativeIcon } from '@/components/presentation/foundation/native-icon';
import CheckIcon from '@expo/material-symbols/check.xml';
import TouchableRipple from '@/components/presentation/foundation/touchable-ripple';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { ImageSourcePropType, View } from 'react-native';
import { SFSymbol } from 'sf-symbols-typescript';

/** An icon is given for both platforms or not at all. */
export type ChipIcon =
  | { icon: ImageSourcePropType; systemImage: SFSymbol }
  | { icon?: undefined; systemImage?: undefined };

export function Chip(
  props: ChipIcon & {
    children: string;
    onPress: () => void;
    selected?: boolean;
    mode?: 'flat' | 'outlined';
    showSelectedCheck?: boolean;
    testID?: string;
  },
) {
  const { colors } = useAppTheme();
  const { selected = false, mode = 'flat', showSelectedCheck = true } = props;
  const icon: ChipIcon = props.icon
    ? { icon: props.icon, systemImage: props.systemImage }
    : selected && showSelectedCheck
      ? { icon: CheckIcon, systemImage: 'checkmark' }
      : {};
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
          paddingInlineStart: icon.icon ? spacing[2] : spacing[4],
          paddingInlineEnd: spacing[4],
        }}
      >
        {icon.icon ? (
          <NativeIcon icon={icon.icon} systemImage={icon.systemImage} size={18} color={contentColor} />
        ) : undefined}
        <AppText variant="labelLarge" style={{ color: contentColor }}>
          {props.children}
        </AppText>
      </View>
    </TouchableRipple>
  );
}
