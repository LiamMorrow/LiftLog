import type { Meta, StoryObj } from '@storybook/react-native';
import DeleteIcon from '@expo/material-symbols/delete.xml';
import EditIcon from '@expo/material-symbols/edit.xml';
import MoreVertIcon from '@expo/material-symbols/more_vert.xml';
import ShareIcon from '@expo/material-symbols/share.xml';
import { fn } from 'storybook/test';
import { View } from 'react-native';
import Menu from '@/components/presentation/foundation/menu';

const meta = {
  title: 'Foundation/Menu',
  component: Menu,
  args: {
    trigger: { icon: MoreVertIcon, systemImage: 'ellipsis', label: 'More' },
    items: [
      { label: 'Edit', icon: EditIcon, systemImage: 'pencil', onPress: fn() },
      { label: 'Share', icon: ShareIcon, systemImage: 'square.and.arrow.up', onPress: fn() },
      { label: 'Delete', icon: DeleteIcon, systemImage: 'trash', destructive: true, onPress: fn() },
    ],
  },
  render: (args) => (
    <View style={{ alignItems: 'flex-start' }}>
      <Menu {...args} />
    </View>
  ),
} satisfies Meta<typeof Menu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TonalTrigger: Story = {
  args: { trigger: { icon: MoreVertIcon, systemImage: 'ellipsis', label: 'More', variant: 'tonal' } },
};

export const WithDisabledItem: Story = {
  args: {
    items: [
      { label: 'Edit', onPress: fn() },
      { label: 'Share', onPress: fn(), disabled: true },
    ],
  },
};
