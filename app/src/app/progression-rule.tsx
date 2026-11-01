import {
  ProgressionRuleEditor,
  ProgressionRuleEditorInput,
} from '@/components/presentation/workout-editor/progressive-overload';
import { useRouteEditorSession } from '@/hooks/useRouteEditor';
import { ProgressionRule } from '@/models/blueprint-models';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function ProgressionRulePage() {
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  const { dismiss } = useRouter();
  const { input, send } = useRouteEditorSession<ProgressionRuleEditorInput, ProgressionRule[]>(requestId);
  if (!input) {
    return null;
  }
  return <ProgressionRuleEditor input={input} onChange={send} onClose={() => dismiss()} />;
}
