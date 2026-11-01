import type { Meta, StoryObj } from '@storybook/react-native';
import { fn } from 'storybook/test';
import { AppText } from '@/components/presentation/foundation/app-text';
import { CardContent } from '@/components/presentation/foundation/card';
import CardActions from '@/components/presentation/foundation/card-actions';
import CardList from '@/components/presentation/foundation/card-list';
import EmptyInfo from '@/components/presentation/foundation/empty-info';
import { NativeButton } from '@/components/presentation/foundation/native-button';

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
    renderItemActions: () => (
      <CardActions>
        <NativeButton variant="text" label="Start" onPress={fn()} />
      </CardActions>
    ),
  },
};

export const Empty: Story = { args: { items: [] } };
