import type { Meta, StoryObj } from '@storybook/react-native';
import { fn } from 'storybook/test';
import { View } from 'react-native';
import { AppText } from '@/components/presentation/foundation/app-text';
import TouchableRipple from '@/components/presentation/foundation/touchable-ripple';

const meta = {
  title: 'Foundation/TouchableRipple',
  component: TouchableRipple,
  args: {
    onPress: fn(),
    disabled: false,
    style: { borderRadius: 12, overflow: 'hidden' },
    children: (
      <View style={{ padding: 16 }}>
        <AppText variant="bodyLarge">Tap me</AppText>
      </View>
    ),
  },
} satisfies Meta<typeof TouchableRipple>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLongPress: Story = { args: { onLongPress: fn() } };

export const Disabled: Story = { args: { disabled: true } };
