import type { Meta, StoryObj } from '@storybook/react-native';
import { Button, HStack } from '@expo/ui/swift-ui';
import { Platform } from 'react-native';
import { AppText } from '@/components/presentation/foundation/app-text';
import { glassButtonStyle } from '@/components/presentation/foundation/glass-button-style';
import { InlineHost } from '@/components/presentation/foundation/inline-host';

function GlassButtons() {
  if (Platform.OS !== 'ios') {
    return <AppText>Glass button style is iOS only</AppText>;
  }
  return (
    <InlineHost matchContents>
      <HStack spacing={8}>
        <Button label="Regular" modifiers={[glassButtonStyle('regular')]} onPress={() => {}} />
        <Button label="Prominent" modifiers={[glassButtonStyle('prominent')]} onPress={() => {}} />
      </HStack>
    </InlineHost>
  );
}

const meta = {
  title: 'Foundation/GlassButtonStyle',
  component: GlassButtons,
} satisfies Meta<typeof GlassButtons>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Prominences: Story = {};
