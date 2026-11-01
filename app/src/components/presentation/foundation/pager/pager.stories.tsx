import type { Meta, StoryObj } from '@storybook/react-native';
import { fn } from 'storybook/test';
import { View } from 'react-native';
import { AppText } from '@/components/presentation/foundation/app-text';
import { Pager } from '@/components/presentation/foundation/pager';
import { useAppTheme } from '@/hooks/useAppTheme';

function Page({ label }: { label: string }) {
  const { colors } = useAppTheme();
  return (
    <View
      style={{
        height: 160,
        marginHorizontal: 4,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surfaceContainerHigh,
      }}
    >
      <AppText variant="headlineMedium">{label}</AppText>
    </View>
  );
}

const meta = {
  title: 'Foundation/Pager',
  component: Pager,
  args: {
    onPageChange: fn(),
    scrollEnabled: true,
    showIndicator: true,
    children: [<Page key="1" label="Welcome" />, <Page key="2" label="Units" />, <Page key="3" label="Theme" />],
  },
} satisfies Meta<typeof Pager>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ControlledPage: Story = { args: { page: 1 } };

export const NoIndicator: Story = { args: { showIndicator: false } };

export const ScrollDisabled: Story = { args: { scrollEnabled: false } };
