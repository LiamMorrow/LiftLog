import Icon from '@/components/presentation/foundation/icon';
import TouchableRipple from '@/components/presentation/foundation/touchable-ripple';
import { AppIconSource } from '@/components/presentation/foundation/ms-icon-source';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { ReactNode } from 'react';
import { View } from 'react-native';
import { AppText } from '@/components/presentation/foundation/app-text';
import { Card } from 'react-native-paper';

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
            <AppText variant="labelLarge" lineBreakMode="tail" numberOfLines={1}>
              {props.title}
            </AppText>
          </View>
          <AppText>{props.value}</AppText>
        </View>
      </Wrapper>
    </Card>
  );
}
