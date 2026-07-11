import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import Icon from '@/components/presentation/foundation/gesture-wrappers/icon';
import { PageAction, PageActionsProps } from '@/components/presentation/foundation/page-actions-props';
import {
  Button,
  HorizontalFloatingToolbar,
  Host,
  Row,
  Shape,
  Text,
  TextButton,
} from '@expo/ui/jetpack-compose';
import { View } from 'react-native';

const contentPadding = { start: 24, top: 16, end: 24, bottom: 16 };

export function PageActions({ primary, secondary = [], primaryKind = 'surface' }: PageActionsProps) {
  const { colors } = useAppTheme();

  const label = (action: PageAction, color: string, iconSize: number) => (
    <Row horizontalArrangement={{ spacedBy: spacing[2] }} verticalAlignment="center">
      <Icon source={action.icon} size={iconSize} color={color} />
      <Text>{action.label}</Text>
    </Row>
  );

  return (
    <View
      style={{
        alignItems: 'flex-end',
        paddingHorizontal: spacing.pageHorizontalMargin,
        paddingBottom: spacing[3],
      }}
    >
      <Host matchContents seedColor={colors.seedColor}>
        {primaryKind === 'surface' ? (
          <HorizontalFloatingToolbar variant="standard">
            <HorizontalFloatingToolbar.FloatingActionButton onPress={primary.onPress}>
              <Icon source={primary.icon} size={24} color={colors.onPrimaryContainer} />
            </HorizontalFloatingToolbar.FloatingActionButton>
            {secondary.map((action) => (
              <TextButton key={action.label} onClick={action.onPress}>
                {label(action, colors.onSecondaryContainer, 20)}
              </TextButton>
            ))}
          </HorizontalFloatingToolbar>
        ) : (
          <Row horizontalArrangement={{ spacedBy: spacing[2] }} verticalAlignment="center">
            {secondary.map((action) => (
              <TextButton key={action.label} onClick={action.onPress}>
                {label(action, colors.primary, 18)}
              </TextButton>
            ))}
            <Button onClick={primary.onPress} shape={Shape.Pill({})} contentPadding={contentPadding}>
              {label(primary, colors.onPrimary, 18)}
            </Button>
          </Row>
        )}
      </Host>
    </View>
  );
}
