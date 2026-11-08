import { LegendListRef } from '@legendapp/list/react-native';
import { AnimatedLegendList } from '@legendapp/list/reanimated';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, StyleProp, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

interface InfinitePagerProps {
  page: number;
  minPage: number;
  maxPage: number;
  onPageChange: (page: number) => void;
  renderPage: (page: number) => ReactNode;
  getPageHeight: (page: number) => number;
  style?: StyleProp<ViewStyle>;
}

export function InfinitePager({
  page,
  minPage,
  maxPage,
  onPageChange,
  renderPage,
  getPageHeight,
  style,
}: InfinitePagerProps) {
  const [width, setWidth] = useState(0);
  const listRef = useRef<LegendListRef>(null);
  const settledPage = useRef(page);
  const scrollOffset = useSharedValue(0);
  const pages = Array.from({ length: maxPage - minPage + 1 }, (_, index) => minPage + index);
  const previousHeight = getPageHeight(page - 1);
  const currentHeight = getPageHeight(page);
  const nextHeight = getPageHeight(page + 1);

  useEffect(() => {
    if (settledPage.current !== page) {
      settledPage.current = page;
      void listRef.current?.scrollToIndex({ index: page - minPage, animated: true });
    }
  }, [page, minPage]);

  const heightStyle = useAnimatedStyle(() => {
    const progress = width > 0 ? Math.min(1, Math.max(-1, scrollOffset.get() / width + minPage - page)) : 0;
    return {
      height:
        progress < 0
          ? currentHeight + (currentHeight - previousHeight) * progress
          : currentHeight + (nextHeight - currentHeight) * progress,
    };
  });

  const onLayout = (e: LayoutChangeEvent) => {
    const measuredWidth = e.nativeEvent.layout.width;
    if (measuredWidth !== width) {
      scrollOffset.set((settledPage.current - minPage) * measuredWidth);
      setWidth(measuredWidth);
    }
  };

  const settleTo = (offsetX: number) => {
    const settled = minPage + Math.round(offsetX / width);
    if (settled !== settledPage.current) {
      settledPage.current = settled;
      onPageChange(settled);
    }
  };
  const onScrollEndDrag = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    settleTo(e.nativeEvent.targetContentOffset?.x ?? e.nativeEvent.contentOffset.x);
  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => settleTo(e.nativeEvent.contentOffset.x);

  return (
    <View style={style} onLayout={onLayout}>
      <Animated.View style={[{ overflow: 'hidden' }, heightStyle]}>
        {width > 0 && (
          <AnimatedLegendList
            key={width}
            ref={listRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            data={pages}
            extraData={renderPage}
            keyExtractor={(item) => item.toString()}
            getFixedItemSize={() => width}
            initialScrollIndex={page - minPage}
            sharedValues={{ scrollOffset }}
            onScrollEndDrag={onScrollEndDrag}
            onMomentumScrollEnd={onMomentumScrollEnd}
            renderItem={({ item }) => <View style={{ width }}>{renderPage(item)}</View>}
          />
        )}
      </Animated.View>
    </View>
  );
}
