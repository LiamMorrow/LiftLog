import type { Meta, StoryObj } from '@storybook/react-native';
import { fn } from 'storybook/test';
import { AppText } from '@/components/presentation/foundation/app-text';
import { Card, CardContent } from '@/components/presentation/foundation/card';

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
