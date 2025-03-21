import { useAppTheme } from '@/hooks/useAppTheme';
import { useScroll } from '@/hooks/useScollListener';
import { View, ScrollView } from 'react-native';

export default function FullHeightScrollView({
  children,
}: {
  children: React.ReactNode;
  afterScrollChildren?: React.ReactNode;
}) {
  const { colors } = useAppTheme();
  const { setScrolled } = useScroll();

  return (
    <View
      style={[
        {
          position: 'relative',
          backgroundColor: colors.surface,
          height: '100%',
        },
      ]}
    >
      <ScrollView
        onScroll={(e) => setScrolled(e.nativeEvent.contentOffset.y > 0)}
        style={{
          height: '100%',
        }}
      >
        {children}
      </ScrollView>
    </View>
  );
}
