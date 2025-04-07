import { ReactNode } from 'react';
import { View } from 'react-native';

export default function TabsOffset(props: { children: ReactNode }) {
  return <View style={{ paddingBottom: 88 }}>{props.children}</View>;
}
