import Icon from '@/components/presentation/foundation/gesture-wrappers/icon';
import TouchableRipple from '@/components/presentation/foundation/gesture-wrappers/touchable-ripple';
import { AppIconSource } from '@/components/presentation/foundation/ms-icon-source';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { ReactNode } from 'react';
import { View } from 'react-native';
import { Card, Text } from 'react-native-paper';

export default function SingleValueStatisticCard(props: {
  title: string;
  value: string | ReactNode;
  icon: AppIconSource;
  onPress?: () => void;
}) {
  const { colors } = useAppTheme();
  const Wrapper = props.onPress ? TouchableRipple : View;
  return (
    <Card mode="contained" style={{ flex: 1, overflow: 'hidden' }}>
      <Wrapper onPress={props.onPress}>
        <View
          style={{
            gap: spacing[1],
            padding: spacing[4],
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing[2],
            }}
          >
            <Icon size={16} source={props.icon} color={colors.primary} />
            <Text variant="labelLarge" lineBreakMode="tail" numberOfLines={1}>
              {props.title}
            </Text>
          </View>
          <Text>{props.value}</Text>
        </View>
      </Wrapper>
    </Card>
  );
}
