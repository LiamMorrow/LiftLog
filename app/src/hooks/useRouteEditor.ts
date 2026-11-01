import { useAppSelector } from '@/store';
import { clearRouteEditorOutput, setRouteEditorInput, setRouteEditorOutput } from '@/store/app';
import { uuid } from '@/utils/uuid';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

type RouteEditorPath = '/rest-editor' | '/progression-rule' | '/progression-example' | '/color-picker';

export function useRouteEditor<TOutput>(onChange?: (value: TOutput) => void) {
  const dispatch = useDispatch();
  const { push } = useRouter();
  const [requestId] = useState(() => uuid());
  const output = useAppSelector((x) => x.app.routeEditorOutput);

  useEffect(() => {
    if (output?.requestId !== requestId) {
      return;
    }
    dispatch(clearRouteEditorOutput());
    onChange?.(output.value as TOutput);
  }, [output, requestId, dispatch, onChange]);

  return (pathname: RouteEditorPath, input: unknown) => {
    dispatch(setRouteEditorInput({ requestId, value: input }));
    push({ pathname, params: { requestId } });
  };
}

export function useRouteEditorSession<TInput, TOutput = TInput>(requestId: string) {
  const dispatch = useDispatch();
  const posted = useAppSelector((x) => x.app.routeEditorInput);
  const [input] = useState(() => (posted?.requestId === requestId ? (posted.value as TInput) : undefined));
  const send = (value: TOutput) => dispatch(setRouteEditorOutput({ requestId, value }));
  return { input, send };
}
