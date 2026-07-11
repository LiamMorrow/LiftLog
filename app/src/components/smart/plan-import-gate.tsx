import { useAppSelector } from '@/store';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

/**
 * Watches for a plan parsed from an imported file (whether picked in-app or
 * opened from the OS) and routes to the import preview screen to confirm it.
 */
export function PlanImportGate() {
  const hasPendingImport = useAppSelector((s) => !!s.program.pendingImport);
  const { navigate } = useRouter();
  useEffect(() => {
    if (hasPendingImport) {
      navigate('/settings/import-plan');
    }
  }, [hasPendingImport, navigate]);
  return null;
}
