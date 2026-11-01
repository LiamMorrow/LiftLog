import type { Meta, StoryObj } from '@storybook/react-native';
import { AppText } from '@/components/presentation/foundation/app-text';
import { Card, CardContent } from '@/components/presentation/foundation/card';
import { Jiggler } from '@/components/presentation/foundation/jiggler';

const meta = {
  title: 'Foundation/Jiggler',
  component: Jiggler,
  args: {
    jiggling: true,
    jiggleSpeed: 80,
    style: { alignSelf: 'center' },
    children: (
      <Card>
        <CardContent>
          <AppText variant="titleMedium">Rest over</AppText>
        </CardContent>
      </Card>
    ),
  },
} satisfies Meta<typeof Jiggler>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Jiggling: Story = {};

export const Still: Story = { args: { jiggling: false } };

export const Slow: Story = { args: { jiggleSpeed: 200 } };
