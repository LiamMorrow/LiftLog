import type { Meta, StoryObj } from '@storybook/react-native';
import DeleteIcon from '@expo/material-symbols/delete.xml';
import EditIcon from '@expo/material-symbols/edit.xml';
import { fn } from 'storybook/test';
import { AppText } from '@/components/presentation/foundation/app-text';
import PageMenu from '@/components/presentation/foundation/page-menu';

const meta = {
  title: 'Foundation/PageMenu',
  component: PageMenu,
  args: {
    items: [
      { label: 'Edit', icon: EditIcon, systemImage: 'pencil', onPress: fn() },
      { label: 'Delete', icon: DeleteIcon, systemImage: 'trash', destructive: true, onPress: fn() },
    ],
  },
  render: (args) => (
    <>
      <PageMenu {...args} />
      <AppText>The menu sits in the page header</AppText>
    </>
  ),
} satisfies Meta<typeof PageMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
