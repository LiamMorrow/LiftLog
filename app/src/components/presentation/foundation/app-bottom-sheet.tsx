import BottomSheet, { BottomSheetProps } from '@gorhom/bottom-sheet';
import { Portal } from 'react-native-paper';
import { useAppTheme } from '@/hooks/useAppTheme';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { useState } from 'react';
import { usePreventNavigate } from '@/hooks/usePreventNavigate';

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
  const [isOpen, setIsOpen] = useState(false);
  usePreventNavigate(isOpen, () => {
    sheetRef.current?.close();
  });

  return (
    <Portal>
      <BottomSheet
        ref={sheetRef}
        onChange={(index, position, type) => {
          setIsOpen(index !== -1);
          rest.onChange?.(index, position, type);
        }}
        snapPoints={snapPoints ?? ['80%']}
        backgroundStyle={[{ backgroundColor: colors.surfaceContainerHighest }, backgroundStyle]}
        handleIndicatorStyle={[{ backgroundColor: colors.outline }, handleIndicatorStyle]}
        {...rest}
      >
        {children}
      </BottomSheet>
    </Portal>
  );
}
