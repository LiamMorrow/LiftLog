import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { fn } from 'storybook/test';
import ThemeChooser from '@/components/presentation/foundation/editors/theme-chooser';

type Props = React.ComponentProps<typeof ThemeChooser>;

function StatefulThemeChooser(props: Props) {
  const [trueBlack, setTrueBlack] = useState(props.trueBlack);
  const [themeMode, setThemeMode] = useState(props.themeMode);
  return (
    <ThemeChooser
      {...props}
      trueBlack={trueBlack}
      setTrueBlack={setTrueBlack}
      themeMode={themeMode}
      setThemeMode={setThemeMode}
    />
  );
}

const meta = {
  title: 'Foundation/Editors/ThemeChooser',
  component: ThemeChooser,
  args: {
    seed: 'default',
    trueBlack: false,
    setTrueBlack: fn(),
    onUpdateTheme: fn(),
    themeMode: 'system',
    setThemeMode: fn(),
  },
  render: (args) => <StatefulThemeChooser {...args} />,
} satisfies Meta<typeof ThemeChooser>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DefaultSeed: Story = {};

export const PresetSeed: Story = { args: { seed: '#00AAAA' } };

export const CustomSeed: Story = { args: { seed: '#123456' } };
