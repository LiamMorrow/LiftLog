import BottomSheet, { BottomSheetProps } from '@gorhom/bottom-sheet';
import { Portal } from 'react-native-paper';
import { Ref } from 'react';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function AppBottomSheet({
  children,
  sheetRef,
  backgroundStyle,
  handleIndicatorStyle,
  snapPoints,
  ...rest
}: BottomSheetProps & { sheetRef: Ref<BottomSheet> }) {
  const { colors } = useAppTheme();
  return (
    <Portal>
      <BottomSheet
        ref={sheetRef}
        snapPoints={snapPoints ?? ['40%', '70%', '90%']}
        backgroundStyle={[
          { backgroundColor: colors.surfaceContainerHighest },
          backgroundStyle,
        ]}
        handleIndicatorStyle={[
          { backgroundColor: colors.outline },
          handleIndicatorStyle,
        ]}
        {...rest}
      >
        {children}
      </BottomSheet>
    </Portal>
  );
}
