import type { Preview } from '@storybook/react-native';
import { View } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';

function Backdrop({ children }: { children: React.ReactNode }) {
  const { colors } = useAppTheme();
  return <View style={{ flex: 1, padding: 16, backgroundColor: colors.background }}>{children}</View>;
}

const preview: Preview = {
  decorators: [
    (Story) => (
      <Backdrop>
        <Story />
      </Backdrop>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
