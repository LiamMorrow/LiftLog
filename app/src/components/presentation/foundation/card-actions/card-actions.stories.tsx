import type { Meta, StoryObj } from '@storybook/react-native';
import { fn } from 'storybook/test';
import { AppText } from '@/components/presentation/foundation/app-text';
import { Card, CardContent } from '@/components/presentation/foundation/card';
import CardActions from '@/components/presentation/foundation/card-actions';
import { NativeButton } from '@/components/presentation/foundation/native-button';

const meta = {
  title: 'Foundation/CardActions',
  component: CardActions,
  args: { children: null },
  render: (args) => (
    <Card>
      <CardContent>
        <AppText variant="titleMedium">Push day</AppText>
        <AppText variant="bodyMedium">4 exercises</AppText>
      </CardContent>
      <CardActions {...args}>
        <NativeButton variant="text" label="Edit" onPress={fn()} />
        <NativeButton variant="tonal" label="Start" onPress={fn()} />
      </CardActions>
    </Card>
  ),
} satisfies Meta<typeof CardActions>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
