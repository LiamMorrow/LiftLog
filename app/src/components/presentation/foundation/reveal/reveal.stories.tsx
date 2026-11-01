import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { AppText } from '@/components/presentation/foundation/app-text';
import { Card, CardContent } from '@/components/presentation/foundation/card';
import { NativeButton } from '@/components/presentation/foundation/native-button';
import { Reveal } from '@/components/presentation/foundation/reveal';

function ToggledReveal() {
  const [shown, setShown] = useState(false);
  return (
    <View style={{ gap: 8 }}>
      <NativeButton variant="tonal" label={shown ? 'Hide' : 'Show'} onPress={() => setShown(!shown)} />
      <Reveal>
        {shown ? (
          <Card>
            <CardContent>
              <AppText variant="titleMedium">Alex cheered you on</AppText>
            </CardContent>
          </Card>
        ) : undefined}
      </Reveal>
      <AppText color="onSurfaceVariant">Content below moves with it</AppText>
    </View>
  );
}

const meta = {
  title: 'Foundation/Reveal',
  component: ToggledReveal,
} satisfies Meta<typeof ToggledReveal>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Toggle: Story = {};
