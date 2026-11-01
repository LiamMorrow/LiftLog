import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { AppText } from '@/components/presentation/foundation/app-text';
import { InfinitePager } from '@/components/presentation/foundation/infinite-pager';
import { useAppTheme } from '@/hooks/useAppTheme';

const pageHeight = (page: number) => 120 + (Math.abs(page) % 3) * 60;

function Page({ page }: { page: number }) {
  const { colors } = useAppTheme();
  return (
    <View
      style={{
        height: pageHeight(page),
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surfaceContainerHigh,
      }}
    >
      <AppText variant="headlineMedium">Week {page}</AppText>
    </View>
  );
}

function StatefulPager() {
  const [page, setPage] = useState(0);
  return (
    <View style={{ gap: 8 }}>
      <AppText>Page {page}</AppText>
      <InfinitePager
        page={page}
        minPage={-20}
        maxPage={20}
        onPageChange={setPage}
        getPageHeight={pageHeight}
        renderPage={(item) => <Page page={item} />}
      />
    </View>
  );
}

const meta = {
  title: 'Foundation/InfinitePager',
  component: StatefulPager,
} satisfies Meta<typeof StatefulPager>;

export default meta;

type Story = StoryObj<typeof meta>;

export const VaryingHeights: Story = {};
