import { useEffect } from 'react';

// oxlint-disable-next-line react-hooks/exhaustive-deps
export const useMountEffect = (fun: () => void) => useEffect(fun, []);
