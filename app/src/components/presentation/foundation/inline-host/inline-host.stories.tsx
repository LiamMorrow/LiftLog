import type { Meta, StoryObj } from '@storybook/react-native';
import { ProgressView, Text } from '@expo/ui/swift-ui';
import { Platform } from 'react-native';
import { AppText } from '@/components/presentation/foundation/app-text';
import { InlineHost } from '@/components/presentation/foundation/inline-host';

function InlineSwiftUI() {
  if (Platform.OS !== 'ios') {
    return <AppText>InlineHost hosts SwiftUI, so it is iOS only</AppText>;
  }
  return (
    <>
      <InlineHost matchContents>
        <Text>SwiftUI text inline with React Native</Text>
      </InlineHost>
      <InlineHost matchContents>
        <ProgressView />
      </InlineHost>
    </>
  );
}

const meta = {
  title: 'Foundation/InlineHost',
  component: InlineSwiftUI,
} satisfies Meta<typeof InlineSwiftUI>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
