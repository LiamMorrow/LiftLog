import { DurationInput } from '@/components/presentation/foundation/editors/number-inputs';
import { spacing } from '@/hooks/useAppTheme';
import { Rest } from '@/models/blueprint-models';
import { Duration } from '@js-joda/core';
import { useTranslate } from '@tolgee/react';
import { useState } from 'react';
import { View } from 'react-native';
import { match } from 'ts-pattern';
import { Dialog, Text } from 'react-native-paper';
import { Portal } from 'react-native-paper';
import Button from '@/components/presentation/foundation/button';
import SegmentedPicker from '@/components/presentation/foundation/segmented-picker';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { RestRangeSlider, useRestThumbStyles } from '@/components/presentation/workout-editor/rest-range-slider';

type ButtonValues = 'short' | 'medium' | 'long' | 'custom';

interface RestEditorDialogProps {
  rest: Rest;
  onRestUpdated: (rest: Rest) => void;
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
}
export function RestEditorDialog(props: RestEditorDialogProps) {
  const { t } = useTranslate();

  const { onRestUpdated, rest } = props;
  const [buttonValue, setButtonValue] = useState(
    match(rest)
      .returnType<ButtonValues>()
      .with(Rest.short, () => 'short')
      .with(Rest.medium, () => 'medium')
      .with(Rest.long, () => 'long')
      .otherwise(() => 'custom'),
  );
  const handleValueChange = (val: ButtonValues) => {
    setButtonValue(val);
    if (val === 'custom') {
    } else {
      onRestUpdated(Rest[val]);
    }
  };

  const updateCustomRest = (next: Rest) => {
    setButtonValue('custom');
    onRestUpdated(next);
  };
  const updateRest = (type: keyof Rest) => (duration: Duration) => updateCustomRest({ ...rest, [type]: duration });
  const thumbStyles = useRestThumbStyles();

  const durationRows = [
    { key: 'minRest', label: t('rest.min.label') },
    { key: 'maxRest', label: t('rest.max.label') },
    { key: 'failureRest', label: t('rest.failure.label') },
  ] as const;
  const customView = (
    <View style={{ gap: spacing[3], marginBlockStart: spacing[4] }}>
      <RestRangeSlider rest={rest} onChange={updateCustomRest} />
      {durationRows.map(({ key, label }) => (
        <View key={key} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
          <View
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              borderWidth: 2,
              borderColor: key === 'minRest' ? thumbStyles[key].border : thumbStyles[key].fill,
              backgroundColor: thumbStyles[key].fill,
            }}
          />
          <Text variant="labelLarge" style={{ flex: 1 }}>
            {label}
          </Text>
          <DurationInput duration={rest[key]} onDurationUpdated={updateRest(key)} />
        </View>
      ))}
    </View>
  );
  return (
    props.dialogOpen && (
      <Portal>
        <KeyboardAvoidingView
          behavior={'height'}
          style={{
            flex: 1,
            pointerEvents: props.dialogOpen ? 'box-none' : 'none',
          }}
        >
          <Dialog visible={props.dialogOpen} onDismiss={() => props.setDialogOpen(false)}>
            <Dialog.Content>
              <View style={{ width: '100%' }}>
                <SegmentedPicker
                  value={buttonValue}
                  onChange={handleValueChange}
                  equalWidth={false}
                  options={[
                    {
                      value: 'short',
                      label: t('rest.short.label'),
                    },
                    {
                      value: 'medium',
                      label: t('rest.medium.label'),
                    },
                    {
                      value: 'long',
                      label: t('rest.long.label'),
                    },
                    {
                      value: 'custom',
                      label: t('generic.custom.label'),
                    },
                  ]}
                />
              </View>
              {customView}
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => props.setDialogOpen(false)}>{t('generic.close.button')}</Button>
            </Dialog.Actions>
          </Dialog>
        </KeyboardAvoidingView>
      </Portal>
    )
  );
}
