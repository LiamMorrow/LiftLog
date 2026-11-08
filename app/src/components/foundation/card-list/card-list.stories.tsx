import type { Meta, StoryObj } from '@storybook/react-native';
import { fn } from 'storybook/test';
import { AppText } from '@/components/foundation/app-text';
import { CardContent } from '@/components/foundation/card';
import CardList from '@/components/foundation/card-list';
import EmptyInfo from '@/components/foundation/empty-info';
import { NativeButton } from '@/components/foundation/native-button';

const workouts = ['Push', 'Pull', 'Legs'];

const meta = {
  title: 'Foundation/CardList',
  component: CardList<string>,
  args: {
    items: workouts,
    keySelector: (item: string) => item,
    renderItemContent: (item: string) => (
      <CardContent>
        <AppText variant="titleMedium">{item}</AppText>
      </CardContent>
    ),
    emptyTemplate: <EmptyInfo>No workouts yet</EmptyInfo>,
  },
} satisfies Meta<typeof CardList<string>>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithActions: Story = {
  args: {
    renderItemActions: () => <NativeButton variant="text" label="Start" onPress={fn()} />,
  },
};

export const Empty: Story = { args: { items: [] } };
