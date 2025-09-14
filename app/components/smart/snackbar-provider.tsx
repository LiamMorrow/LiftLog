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
        <Snackbar
          visible={!!currentSnackbar}
          action={
            currentSnackbar?.action
              ? {
                  label: currentSnackbar.action ?? '',
                  onPress: () => {
                    if (Array.isArray(currentSnackbar.dispatchAction)) {
                      currentSnackbar.dispatchAction.forEach((x) =>
                        dispatch(x),
                      );
                    } else {
                      dispatch(currentSnackbar.dispatchAction);
                    }
                  },
                }
              : undefined!
          }
          onDismiss={() => {
            dispatch(setCurrentSnackbar(undefined));
          }}
        >
          {currentSnackbar?.text}
        </Snackbar>
      </Portal>
    </>
  );
}
