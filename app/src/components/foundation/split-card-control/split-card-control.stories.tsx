import type { Meta, StoryObj } from '@storybook/react-native';
import EditIcon from '@expo/material-symbols/edit.xml';
import { fn } from 'storybook/test';
import { AppText } from '@/components/foundation/app-text';
import { Card, CardContent } from '@/components/foundation/card';
import { NativeIconButton } from '@/components/foundation/native-icon-button';
import SplitCardControl from '@/components/foundation/split-card-control';

const meta = {
  title: 'Foundation/SplitCardControl',
  component: SplitCardControl,
  args: {
    titleContent: <AppText variant="titleMedium">Bench press</AppText>,
    mainContent: <AppText variant="bodyMedium">3 sets of 8 reps at 80 kg</AppText>,
  },
  render: (args) => (
    <Card>
      <CardContent>
        <SplitCardControl {...args} />
      </CardContent>
    </Card>
  ),
} satisfies Meta<typeof SplitCardControl>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithActions: Story = {
  args: { actions: <NativeIconButton icon={EditIcon} systemImage="pencil" label="Edit" onPress={fn()} /> },
};
