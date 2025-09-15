import BottomSheet, { BottomSheetProps } from '@gorhom/bottom-sheet';
import { Portal } from 'react-native-paper';
import { useAppTheme } from '@/hooks/useAppTheme';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';

export default function AppBottomSheet({
  children,
  sheetRef,
  backgroundStyle,
  handleIndicatorStyle,
  snapPoints,
  ...rest
}: BottomSheetProps & {
  sheetRef: React.RefObject<BottomSheetMethods | null>;
}) {
  const { colors } = useAppTheme();
  return (
    <Portal>
      <BottomSheet
        ref={sheetRef}
        snapPoints={snapPoints ?? ['40%', '70%', '80%']}
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
