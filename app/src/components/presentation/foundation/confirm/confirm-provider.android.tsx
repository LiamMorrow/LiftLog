import { Confirmation, ConfirmContext } from './confirm-context';
import { useAppTheme } from '@/hooks/useAppTheme';
import { AlertDialog, Host, Row, Text, TextButton } from '@expo/ui/jetpack-compose';
import { testID } from '@expo/ui/jetpack-compose/modifiers';
import { ReactNode, useState } from 'react';

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const { colors } = useAppTheme();
  const [pending, setPending] = useState<Confirmation>();

  const settle = (action: (() => void) | undefined) => {
    setPending(undefined);
    action?.();
  };

  const okButton = pending && (
    <TextButton onClick={() => settle(pending.onOk)} modifiers={[testID('action-ok')]}>
      <Text>{pending.okText}</Text>
    </TextButton>
  );

  return (
    <ConfirmContext value={setPending}>
      {children}
      {pending && (
        <Host matchContents style={{ position: 'absolute' }} seedColor={colors.seedColor} colorScheme={colors.scheme}>
          <AlertDialog onDismissRequest={() => settle(pending.onCancel)}>
            <AlertDialog.Title>
              <Text style={{ typography: 'headlineSmall' }}>{pending.title}</Text>
            </AlertDialog.Title>
            <AlertDialog.Text>
              <Text style={{ typography: 'bodyMedium' }}>{pending.message}</Text>
            </AlertDialog.Text>
            <AlertDialog.DismissButton>
              <TextButton onClick={() => settle(pending.onCancel)} modifiers={[testID('action-cancel')]}>
                <Text>{pending.cancelText}</Text>
              </TextButton>
            </AlertDialog.DismissButton>
            <AlertDialog.ConfirmButton>
              {pending.additionalAction ? (
                <Row>
                  <TextButton
                    onClick={() => settle(pending.additionalAction?.onPress)}
                    modifiers={[testID('action-additional')]}
                  >
                    <Text>{pending.additionalAction.text}</Text>
                  </TextButton>
                  {okButton}
                </Row>
              ) : (
                okButton
              )}
            </AlertDialog.ConfirmButton>
          </AlertDialog>
        </Host>
      )}
    </ConfirmContext>
  );
}
