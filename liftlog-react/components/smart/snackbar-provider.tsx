import { useAppSelector } from '@/store';
import { setCurrentSnackbar } from '@/store/app';
import { ReactNode } from 'react';
import { Portal, Snackbar } from 'react-native-paper';
import { useDispatch } from 'react-redux';

export default function SnackbarProvider(props: { children: ReactNode }) {
  const currentSnackbar = useAppSelector((s) => s.app.currentSnackbar);
  const dispatch = useDispatch();

  return (
    <>
      {props.children}
      <Portal>
        {
          <Snackbar
            visible={!!currentSnackbar}
            action={{
              label: currentSnackbar?.action ?? '',
              onPress: () => {
                currentSnackbar && dispatch(currentSnackbar.dispatchAction);
                dispatch(setCurrentSnackbar(undefined));
              },
            }}
            onDismiss={() => {}}
          >
            {currentSnackbar?.text}
          </Snackbar>
        }
      </Portal>
    </>
  );
}
