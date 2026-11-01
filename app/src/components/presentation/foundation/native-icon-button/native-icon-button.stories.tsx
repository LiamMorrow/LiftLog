import type { Meta, StoryObj } from '@storybook/react-native';
import ChevronRightIcon from '@expo/material-symbols/chevron_right.xml';
import EditIcon from '@expo/material-symbols/edit.xml';
import { fn } from 'storybook/test';
import { NativeIconButton } from '@/components/presentation/foundation/native-icon-button';

const meta = {
  title: 'Foundation/NativeIconButton',
  component: NativeIconButton,
  args: { icon: EditIcon, systemImage: 'pencil', label: 'Edit', onPress: fn(), variant: 'standard', disabled: false },
  argTypes: { variant: { control: 'select', options: ['standard', 'filled', 'tonal', 'outlined'] } },
} satisfies Meta<typeof NativeIconButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Standard: Story = {};

export const Filled: Story = { args: { variant: 'filled' } };

export const Tonal: Story = { args: { variant: 'tonal' } };

export const Outlined: Story = { args: { variant: 'outlined' } };

export const Large: Story = { args: { variant: 'tonal', iconSize: 36 } };

export const Mirrored: Story = {
  args: { icon: ChevronRightIcon, systemImage: 'chevron.right', label: 'Next', mirrored: true },
};

export const Disabled: Story = { args: { disabled: true } };
