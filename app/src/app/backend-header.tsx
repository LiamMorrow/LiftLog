import { BackendHeaderForm } from '@/components/smart/backend-header-form';
import { useLocalSearchParams } from 'expo-router';

export default function BackendHeaderPage() {
  const { backendId, headerIndex } = useLocalSearchParams<{ backendId: string; headerIndex: string }>();
  return <BackendHeaderForm backendId={backendId} headerIndex={Number(headerIndex)} />;
}
