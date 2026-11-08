import { DateRangePickerProps } from './date-range-picker-props';
import { useAppTheme } from '@/hooks/useAppTheme';
import { convert, nativeJs } from '@js-joda/core';
import { BottomSheet, Button, DatePicker, Group, Host, VStack } from '@expo/ui/swift-ui';
import {
  buttonStyle,
  controlSize,
  datePickerStyle,
  foregroundStyle,
  padding,
  presentationDragIndicator,
  tint,
} from '@expo/ui/swift-ui/modifiers';
import { useTranslate } from '@tolgee/react';
import { useState } from 'react';

export function DateRangePicker({ visible, value, onConfirm, onDismiss }: DateRangePickerProps) {
  const { colors } = useAppTheme();
  const { t } = useTranslate();
  const [draft, setDraft] = useState(value);
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setDraft(value);
    }
  }

  return (
    <Host matchContents style={{ position: 'absolute' }} seedColor={colors.seedColor} colorScheme={colors.scheme}>
      <BottomSheet
        isPresented={visible}
        onIsPresentedChange={(presented) => {
          if (!presented) {
            onDismiss();
          }
        }}
        fitToContents
      >
        <Group modifiers={[presentationDragIndicator('visible')]}>
          <VStack spacing={16} modifiers={[padding({ all: 24 })]}>
            <DatePicker
              title={t('date_range.from.label')}
              selection={convert(draft.from).toDate()}
              range={{ end: convert(draft.to).toDate() }}
              displayedComponents={['date']}
              onDateChange={(date) => setDraft({ ...draft, from: nativeJs(date).toLocalDate() })}
              modifiers={[datePickerStyle('compact')]}
            />
            <DatePicker
              title={t('date_range.to.label')}
              selection={convert(draft.to).toDate()}
              range={{ start: convert(draft.from).toDate() }}
              displayedComponents={['date']}
              onDateChange={(date) => setDraft({ ...draft, to: nativeJs(date).toLocalDate() })}
              modifiers={[datePickerStyle('compact')]}
            />
            <Button
              label={t('generic.done.button')}
              onPress={() => onConfirm(draft)}
              modifiers={[
                buttonStyle('borderedProminent'),
                controlSize('large'),
                tint(colors.primary),
                foregroundStyle(colors.onPrimary),
              ]}
            />
          </VStack>
        </Group>
      </BottomSheet>
    </Host>
  );
}
