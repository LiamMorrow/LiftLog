import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import Form from '@/components/presentation/foundation/form';
import { RestEditor } from '@/components/presentation/workout-editor/rest-editor';
import { useRouteEditorSession } from '@/hooks/useRouteEditor';
import { Rest } from '@/models/blueprint-models';
import { useTranslate } from '@tolgee/react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

export default function RestEditorPage() {
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  const { t } = useTranslate();
  const { input, send } = useRouteEditorSession<Rest>(requestId);
  const [rest, setRest] = useState(input);

  if (!rest) {
    return null;
  }

  const updateRest = (next: Rest) => {
    setRest(next);
    send(next);
  };

  return (
    <FullHeightScrollView modal avoidKeyboard>
      <Stack.Screen options={{ title: t('rest.rest.label') }} />
      <Form>
        <RestEditor rest={rest} onRestUpdated={updateRest} />
      </Form>
    </FullHeightScrollView>
  );
}
