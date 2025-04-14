import { SurfaceText } from '@/components/presentation/surface-text';
import { T } from '@tolgee/react';
import { ReactNode } from 'react';
import { Button, Dialog, Portal } from 'react-native-paper';

interface ConfirmationDialogProps {
  open: boolean;
  headline: ReactNode;
  textContent: ReactNode;
  cancelText?: string;
  okText?: string;
  preventCancel?: boolean;
  onCancel: () => void;
  onOk: () => void;
}

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
  } = props;

  return (
    <Portal>
      <Dialog visible={open} dismissable={!preventCancel}>
        <Dialog.Title>{headline}</Dialog.Title>
        <Dialog.Content>
          <SurfaceText>{textContent}</SurfaceText>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onCancel}>
            {cancelText ?? <T keyName="Cancel" />}
          </Button>
          <Button onPress={onOk}>{okText ?? <T keyName="Ok" />}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
