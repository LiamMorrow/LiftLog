import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { PageAction, PageActionsProps } from '@/components/presentation/foundation/page-actions-props';
import {
  Button,
  ExtendedFloatingActionButton,
  HorizontalFloatingToolbar,
  Host,
  Icon,
  Row,
  Shape,
  Text,
  TextButton,
} from '@expo/ui/jetpack-compose';
import { View } from 'react-native';
import { useScroll } from '@/hooks/useScrollListener';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

const contentPadding = { start: 24, top: 16, end: 24, bottom: 16 };

export function PageActions({ primary, secondary = [], primaryKind = 'surface' }: PageActionsProps) {
  const { colors } = useAppTheme();
  const { isScrollingDown, setScrollingDown } = useScroll();

  // The scroll state is shared across the stack, so without this a page would take on the
  // collapsed FAB of whichever page was scrolled before it.
  useFocusEffect(useCallback(() => setScrollingDown(false), [setScrollingDown]));

  const label = (action: PageAction, color: string, iconSize: number) => (
    <Row horizontalArrangement={{ spacedBy: spacing[2] }} verticalAlignment="center">
      <Icon source={action.icon} size={iconSize} tint={color} />
      <Text>{action.label}</Text>
    </Row>
  );

  // A toolbar holding nothing but a FAB is an icon with no way to read its meaning, so a
  // lone surface action gets an extended FAB, which keeps its label alongside the icon.
  const surfaceActions = secondary.length ? (
    <HorizontalFloatingToolbar variant="standard">
      <HorizontalFloatingToolbar.FloatingActionButton onPress={primary.onPress}>
        <Icon source={primary.icon} size={24} tint={colors.onPrimaryContainer} />
      </HorizontalFloatingToolbar.FloatingActionButton>
      {secondary.map((action) => (
        <TextButton key={action.label} onClick={action.onPress}>
          {label(action, colors.onSecondaryContainer, 20)}
        </TextButton>
      ))}
    </HorizontalFloatingToolbar>
  ) : (
    <ExtendedFloatingActionButton onClick={primary.onPress} expanded={!isScrollingDown}>
      <ExtendedFloatingActionButton.Icon>
        <Icon source={primary.icon} size={24} tint={colors.onPrimaryContainer} />
      </ExtendedFloatingActionButton.Icon>
      <ExtendedFloatingActionButton.Text>
        <Text>{primary.label}</Text>
      </ExtendedFloatingActionButton.Text>
    </ExtendedFloatingActionButton>
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
          surfaceActions
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
