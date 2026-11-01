import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { AccordionItem } from '@/components/presentation/foundation/accordion-item';
import { AppText } from '@/components/presentation/foundation/app-text';
import { NativeButton } from '@/components/presentation/foundation/native-button';

type Props = React.ComponentProps<typeof AccordionItem>;

function ToggledAccordion({ isExpanded, ...rest }: Props) {
  const [expanded, setExpanded] = useState(isExpanded);
  return (
    <View style={{ gap: 8 }}>
      <NativeButton variant="tonal" label={expanded ? 'Collapse' : 'Expand'} onPress={() => setExpanded(!expanded)} />
      <AccordionItem {...rest} isExpanded={expanded} />
    </View>
  );
}

const meta = {
  title: 'Foundation/AccordionItem',
  component: AccordionItem,
  args: {
    isExpanded: false,
    duration: 200,
    unexpandedHeight: 0,
    children: (
      <View style={{ gap: 4 }}>
        <AppText variant="bodyLarge">Keep your back flat.</AppText>
        <AppText variant="bodyLarge">Drive through your heels.</AppText>
        <AppText variant="bodyLarge">Lock out at the top.</AppText>
      </View>
    ),
  },
  render: (args) => <ToggledAccordion {...args} />,
} satisfies Meta<typeof AccordionItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Collapsed: Story = {};

export const StartsExpanded: Story = { args: { isExpanded: true, startsExpanded: true } };

export const PeekWhenCollapsed: Story = { args: { unexpandedHeight: 24 } };
