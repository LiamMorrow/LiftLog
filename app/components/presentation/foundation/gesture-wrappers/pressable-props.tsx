export type GesturePressableProps<T> = Omit<T, `on${string}`> & {
  onPress: undefined | (() => void);
  onLongPress?: undefined | (() => void);
};
