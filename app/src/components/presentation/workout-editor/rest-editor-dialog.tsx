import DurationEditor from '@/components/presentation/foundation/editors/duration-editor';
import { spacing } from '@/hooks/useAppTheme';
import { Rest } from '@/models/blueprint-models';
import { Duration } from '@js-joda/core';
import { useTranslate } from '@tolgee/react';
import { useState } from 'react';
import { View } from 'react-native';
import { match } from 'ts-pattern';
import { Dialog } from 'react-native-paper';
import { Portal } from 'react-native-paper';
import Button from '@/components/presentation/foundation/gesture-wrappers/button';
import SegmentedPicker from '@/components/presentation/foundation/segmented-picker';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

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

  const updateRest = (type: keyof Rest) => (duration: Duration) => onRestUpdated({ ...rest, [type]: duration });

  const customView = (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing[2],
      }}
    >
      <DurationEditor label={t('rest.min.label')} duration={rest.minRest} onDurationUpdated={updateRest('minRest')} />
      <DurationEditor label={t('rest.max.label')} duration={rest.maxRest} onDurationUpdated={updateRest('maxRest')} />
      <DurationEditor
        label={t('rest.failure.label')}
        duration={rest.failureRest}
        onDurationUpdated={updateRest('failureRest')}
      />
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
