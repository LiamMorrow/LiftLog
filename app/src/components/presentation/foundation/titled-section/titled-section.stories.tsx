import type { Meta, StoryObj } from '@storybook/react-native';
import { fn } from 'storybook/test';
import { AppText } from '@/components/presentation/foundation/app-text';
import { Card, CardContent } from '@/components/presentation/foundation/card';
import { NativeButton } from '@/components/presentation/foundation/native-button';
import { TitledSection } from '@/components/presentation/foundation/titled-section';

const meta = {
  title: 'Foundation/TitledSection',
  component: TitledSection,
  args: {
    title: 'Upcoming',
    children: (
      <Card>
        <CardContent>
          <AppText variant="titleMedium">Push day</AppText>
        </CardContent>
      </Card>
    ),
  },
} satisfies Meta<typeof TitledSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithTrailing: Story = {
  args: { trailing: <NativeButton variant="text" compact label="See all" onPress={fn()} /> },
};
