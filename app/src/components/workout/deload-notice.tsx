import { AppText } from '@/components/foundation/app-text';
import { NativeButton } from '@/components/foundation/native-button';
import { spacing } from '@/hooks/useAppTheme';
import { useConfirm } from '@/hooks/useConfirm';
import { useTranslate } from '@tolgee/react';
import { Platform, View } from 'react-native';

const flushMaterialTextButton = Platform.select({
  android: { marginEnd: -spacing[2], marginVertical: -spacing[2] },
});

/** Marks a deload session. `onSwitchToNormal` is given only while the workout can still switch back. */
export function DeloadNotice({ onSwitchToNormal }: { onSwitchToNormal: (() => void) | undefined }) {
  const { t } = useTranslate();
  const confirm = useConfirm();

  const switchToNormal = () =>
    confirm({
      title: t('workout.deload.switch_to_normal.confirm.title'),
      message: t('workout.deload.switch_to_normal.confirm.body'),
      okText: t('workout.deload.switch_to_normal.button'),
      onOk: () => onSwitchToNormal?.(),
    });

  return (
    <View
      testID="deload-notice"
      style={{ gap: spacing[0.5], marginVertical: spacing[2], marginHorizontal: spacing.pageHorizontalMargin }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
        <AppText variant="titleMedium" style={{ flex: 1 }}>
          {t('workout.deload.title')}
        </AppText>
        {onSwitchToNormal ? (
          <NativeButton
            testID="switch-to-normal-workout"
            variant="text"
            compact
            label={t('workout.deload.switch_to_normal.button')}
            onPress={switchToNormal}
            style={flushMaterialTextButton}
          />
        ) : undefined}
      </View>
      <AppText variant="bodyMedium" color="onSurfaceVariant">
        {t('workout.deload.body')}
      </AppText>
    </View>
  );
}
