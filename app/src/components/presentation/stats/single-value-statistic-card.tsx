import { NativeIcon } from '@/components/presentation/foundation/native-icon';
import { Card } from '@/components/presentation/foundation/card';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { ReactNode } from 'react';
import { ImageSourcePropType, View } from 'react-native';
import { SFSymbol } from 'sf-symbols-typescript';
import { AppText } from '@/components/presentation/foundation/app-text';

export default function SingleValueStatisticCard(props: {
  title: string;
  value: string | ReactNode;
  icon: ImageSourcePropType;
  systemImage: SFSymbol;
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
          <NativeIcon icon={props.icon} systemImage={props.systemImage} size={16} color={colors.primary} />
          <AppText variant="labelLarge" lineBreakMode="tail" numberOfLines={1}>
            {props.title}
          </AppText>
        </View>
        <AppText>{props.value}</AppText>
      </View>
    </Card>
  );
}
