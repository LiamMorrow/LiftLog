import type { Meta, StoryObj } from '@storybook/react-native';
import EmptyInfo from '@/components/presentation/foundation/empty-info';
import ItemList from '@/components/presentation/foundation/item-list';
import { ListItem } from '@/components/presentation/foundation/list-item';

const meta = {
  title: 'Foundation/ItemList',
  component: ItemList<string>,
  args: {
    items: ['Bench press', 'Overhead press', 'Dips'],
    renderItem: (item: string) => <ListItem title={item} />,
    verticalPadding: true,
    empty: <EmptyInfo>No exercises</EmptyInfo>,
  },
} satisfies Meta<typeof ItemList<string>>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NoVerticalPadding: Story = { args: { verticalPadding: false } };

export const Empty: Story = { args: { items: [] } };
