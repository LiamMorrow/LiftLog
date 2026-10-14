import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import { DocumentationRow } from '@/components/presentation/foundation/documentation-row';
import Form from '@/components/presentation/foundation/form';
import { PageCaption } from '@/components/presentation/foundation/page-caption';
import { Stack } from 'expo-router';
import { ReactNode, Ref } from 'react';
import { ScrollView } from 'react-native-gesture-handler';

export function SettingsPage(props: {
  title: string;
  caption?: string;
  /** A filename under `docs/`, which becomes a documentation row at the foot of the page. */
  docs?: string;
  actions?: ReactNode;
  scrollRef?: Ref<ScrollView>;
  children?: ReactNode;
}) {
  return (
    <FullHeightScrollView scrollRef={props.scrollRef} floatingChildren={props.actions}>
      <Stack.Screen options={{ title: props.title }} />
      {props.caption ? <PageCaption value={props.caption} /> : undefined}
      <Form>
        {props.children}
        {props.docs ? <DocumentationRow doc={props.docs} /> : undefined}
      </Form>
    </FullHeightScrollView>
  );
}
