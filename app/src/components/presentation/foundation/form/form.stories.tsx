import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import Form from '@/components/presentation/foundation/form';
import { TextField } from '@/components/presentation/foundation/text-field';

function ExampleFields() {
  const [name, setName] = useState('Push day');
  const [notes, setNotes] = useState('');
  return (
    <>
      <TextField underline="always" value={name} onChangeText={setName} placeholder="Name" />
      <TextField underline="always" value={notes} onChangeText={setNotes} placeholder="Notes" multiline />
    </>
  );
}

const meta = {
  title: 'Foundation/Form',
  component: Form,
  args: { children: <ExampleFields /> },
} satisfies Meta<typeof Form>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
