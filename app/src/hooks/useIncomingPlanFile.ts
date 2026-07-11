import { importPlanFromUri } from '@/store/program';
import * as Linking from 'expo-linking';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

/** True for URIs the OS hands us when opening a file, rather than any navigable link. */
export function isFileUri(url: string): boolean {
  return url.startsWith('file://') || url.startsWith('content://');
}

/**
 * Ingests a `.liftlogplan` file the OS handed us — either the URL the app was
 * launched with, or one received while already running. HTTPS app links and the
 * `liftlog://` scheme are left for expo-router; we only handle file/content URIs.
 */
export function useIncomingPlanFile() {
  const dispatch = useDispatch();
  useEffect(() => {
    const handleUrl = (url: string | null) => {
      if (url && isFileUri(url)) {
        dispatch(importPlanFromUri({ uri: url }));
      }
    };

    void Linking.getInitialURL().then(handleUrl);
    const subscription = Linking.addEventListener('url', ({ url }) => handleUrl(url));

    return () => subscription.remove();
  }, [dispatch]);
}
