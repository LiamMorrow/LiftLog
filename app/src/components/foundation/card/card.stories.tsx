import type { Meta, StoryObj } from '@storybook/react-native';
import { fn } from 'storybook/test';
import { AppText } from '@/components/foundation/app-text';
import { Card, CardContent } from '@/components/foundation/card';
import { NativeButton } from '@/components/foundation/native-button';

const meta = {
  title: 'Foundation/Card',
  component: Card,
  args: { children: null },
  render: (args) => (
    <Card {...args}>
      <CardContent>
        <AppText variant="titleMedium">Push day</AppText>
        <AppText variant="bodyMedium">4 exercises</AppText>
      </CardContent>
    </Card>
  ),
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Static: Story = {};

export const Pressable: Story = { args: { onPress: fn() } };

export const WithActions: Story = {
  args: {
    actions: (
      <>
        <NativeButton variant="text" label="Edit" onPress={fn()} />
        <NativeButton variant="tonal" label="Start" onPress={fn()} />
      </>
    ),
  },
};
