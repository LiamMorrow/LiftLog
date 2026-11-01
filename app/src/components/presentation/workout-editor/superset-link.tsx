import { NativeIcon } from '@/components/presentation/foundation/native-icon';
import LinkIcon from '@expo/material-symbols/link.xml';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { useTranslate } from '@tolgee/react';
import { Pressable, View } from 'react-native';

const JOIN_SIZE = 28;
const JOIN_BORDER = 2;

export function SupersetLink(props: { linked: boolean; onToggle: () => void }) {
  const { colors } = useAppTheme();
  const { t } = useTranslate();
  const accessibility = {
    accessibilityRole: 'switch',
    accessibilityState: { checked: props.linked },
    accessibilityLabel: t('workout.superset_with_next.button'),
  } as const;

  if (props.linked) {
    return (
      <View style={{ height: spacing[0.5], zIndex: 1, alignItems: 'center' }}>
        <Pressable
          testID="superset-link"
          onPress={props.onToggle}
          hitSlop={spacing[2]}
          {...accessibility}
          style={{
            position: 'absolute',
            top: (spacing[0.5] - JOIN_SIZE) / 2,
            width: JOIN_SIZE,
            height: JOIN_SIZE,
            borderRadius: JOIN_SIZE / 2,
            borderWidth: JOIN_BORDER,
            borderColor: colors.surface,
            backgroundColor: colors.tertiaryContainer,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <NativeIcon icon={LinkIcon} systemImage="link" size={14} color={colors.onTertiaryContainer} />
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ height: spacing[6], alignItems: 'center', justifyContent: 'center' }}>
      <Pressable
        testID="superset-link"
        onPress={props.onToggle}
        hitSlop={{ top: spacing[2], bottom: spacing[2] }}
        {...accessibility}
        style={{ width: spacing[11], height: spacing[6], alignItems: 'center', justifyContent: 'center' }}
      >
        <NativeIcon icon={LinkIcon} systemImage="link" size={16} color={colors.outline} />
      </Pressable>
    </View>
  );
}
