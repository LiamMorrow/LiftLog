import type { Meta, StoryObj } from '@storybook/react-native';
import { fn } from 'storybook/test';
import { AppText } from '@/components/foundation/app-text';
import { Card, CardContent } from '@/components/foundation/card';
import Holdable from '@/components/foundation/holdable';

const meta = {
  title: 'Foundation/Holdable',
  component: Holdable,
  args: {
    onLongPress: fn(),
    duration: 500,
    disabled: false,
    style: { alignSelf: 'center' },
    children: (
      <Card>
        <CardContent>
          <AppText variant="titleMedium">Hold me</AppText>
        </CardContent>
      </Card>
    ),
  },
} satisfies Meta<typeof Holdable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SlowHold: Story = { args: { duration: 1500 } };

export const Disabled: Story = { args: { disabled: true } };
