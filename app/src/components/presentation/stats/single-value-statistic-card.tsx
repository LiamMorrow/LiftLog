import Icon from '@/components/presentation/foundation/icon';
import { Card } from '@/components/presentation/foundation/card';
import { AppIconSource } from '@/components/presentation/foundation/ms-icon-source';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { ReactNode } from 'react';
import { View } from 'react-native';
import { AppText } from '@/components/presentation/foundation/app-text';

export default function SingleValueStatisticCard(props: {
  title: string;
  value: string | ReactNode;
  icon: AppIconSource;
  onPress?: () => void;
}) {
  const { colors } = useAppTheme();
  return (
    <Card style={{ flex: 1 }} onPress={props.onPress}>
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
    </Card>
  );
}
