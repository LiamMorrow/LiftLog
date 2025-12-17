import { SurfaceText } from '@/components/presentation/surface-text';
import { T } from '@tolgee/react';
import { ReactNode } from 'react';
import { View } from 'react-native';
import { Dialog, Portal } from 'react-native-paper';
import Button from '@/components/presentation/gesture-wrappers/button';

type ConfirmationDialogWithoutAdditionalActionProps = {
  open: boolean;
  headline: ReactNode;
  textContent: ReactNode;
  cancelText?: string;
  okText?: string;
  preventCancel?: boolean;
  additionalActionText?: undefined;
  onAdditionalAction?: undefined;
  onCancel: () => void;
  onOk: () => void;
};

type WithAdditionalActions = {
  additionalActionText: string;
  onAdditionalAction: () => void;
};

type ConfirmationDialogProps =
  | ConfirmationDialogWithoutAdditionalActionProps
  | (Omit<
      ConfirmationDialogWithoutAdditionalActionProps,
      'additionalActionText' | 'onAdditionalAction'
    > &
      WithAdditionalActions);

export default function ConfirmationDialog(props: ConfirmationDialogProps) {
  const {
    open,
    headline,
    textContent,
    cancelText,
    okText,
    onCancel,
    onOk,
    preventCancel,
    additionalActionText,
    onAdditionalAction,
  } = props;

  const cancelButton = (
    <Button testID="action-cancel" onPress={onCancel}>
      {cancelText ?? <T keyName="generic.cancel.button" />}
    </Button>
  );
  const okButton = (
    <Button testID="action-ok" onPress={onOk}>
      {okText ?? <T keyName="generic.ok.button" />}
    </Button>
  );

  const buttons = additionalActionText ? (
    <Dialog.Actions>
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        {cancelButton}
        <View style={{ flexDirection: 'row' }}>
          <Button testID="action-additional" onPress={onAdditionalAction}>
            {additionalActionText}
          </Button>
          {okButton}
        </View>
      </View>
    </Dialog.Actions>
  ) : (
    <Dialog.Actions>
      {cancelButton}
      {okButton}
    </Dialog.Actions>
  );

  return (
    <Portal>
      <Dialog
        visible={open}
        dismissable={!preventCancel}
        onDismiss={() => {
          if (!preventCancel) {
            onCancel();
          }
        }}
      >
        <Dialog.Title>{headline}</Dialog.Title>
        <Dialog.Content>
          <SurfaceText>{textContent}</SurfaceText>
        </Dialog.Content>
        {buttons}
      </Dialog>
    </Portal>
  );
}
