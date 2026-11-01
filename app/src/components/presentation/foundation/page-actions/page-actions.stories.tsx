import type { Meta, StoryObj } from '@storybook/react-native';
import AddIcon from '@expo/material-symbols/add.xml';
import CheckIcon from '@expo/material-symbols/check.xml';
import EditIcon from '@expo/material-symbols/edit.xml';
import ShareIcon from '@expo/material-symbols/share.xml';
import { fn } from 'storybook/test';
import { View } from 'react-native';
import { AppText } from '@/components/presentation/foundation/app-text';
import { Card, CardContent } from '@/components/presentation/foundation/card';
import { PageActions } from '@/components/presentation/foundation/page-actions';

const meta = {
  title: 'Foundation/PageActions',
  component: PageActions,
  args: {
    primary: { label: 'Add workout', icon: AddIcon, systemImage: 'plus', onPress: fn() },
    primaryKind: 'surface',
  },
  argTypes: { primaryKind: { control: 'radio', options: ['surface', 'commit'] } },
  render: (args) => (
    <View style={{ flex: 1, justifyContent: 'flex-end' }}>
      <PageActions {...args} />
    </View>
  ),
} satisfies Meta<typeof PageActions>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Surface: Story = {};

export const Commit: Story = {
  args: { primary: { label: 'Save', icon: CheckIcon, systemImage: 'checkmark', onPress: fn() }, primaryKind: 'commit' },
};

export const WithSecondary: Story = {
  args: {
    secondary: [
      { label: 'Edit', icon: EditIcon, systemImage: 'pencil', onPress: fn() },
      { label: 'Share', icon: ShareIcon, systemImage: 'square.and.arrow.up', onPress: fn() },
    ],
  },
};

export const Collapsed: Story = { args: { primaryExpanded: false } };

export const Expanded: Story = { args: { primaryExpanded: true } };

export const WithAccessory: Story = {
  args: {
    accessory: (
      <Card>
        <CardContent>
          <AppText variant="titleMedium">Rest 1:30</AppText>
        </CardContent>
      </Card>
    ),
  },
};

export const Disabled: Story = {
  args: { primary: { label: 'Add workout', icon: AddIcon, systemImage: 'plus', onPress: fn(), disabled: true } },
};
